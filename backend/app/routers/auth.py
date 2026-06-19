from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.database import SessionLocal, get_db
from app.models import User
from app.utils.auth_utils import verify_password, get_password_hash, create_access_token, decode_token

router = APIRouter(prefix="/api/auth", tags=["Kimlik Doğrulama"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# --- Pydantic Şemaları ---
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    telegram_chat_id: Optional[str] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TelegramUpdateRequest(BaseModel):
    telegram_chat_id: str

# --- Bağımlılık: Mevcut Kullanıcıyı Doğrula ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Geçersiz kimlik bilgisi",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if not payload:
        raise credentials_exception
    username: str = payload.get("sub")
    if not username:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise credentials_exception
    return user

# --- Endpoint'ler ---

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Yeni kullanıcı kaydı oluşturur."""
    # Kullanıcı adı veya email zaten kayıtlı mı kontrol et
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanımda.")
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı.")
    
    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pw,
        full_name=user_data.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Kullanıcı girişi. Geçerli JWT token döner."""
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Mevcut oturum açmış kullanıcının bilgilerini döner."""
    return current_user

@router.put("/me/telegram", response_model=UserResponse)
def update_telegram_id(request: TelegramUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Kullanıcının Telegram Chat ID'sini günceller."""
    current_user.telegram_chat_id = request.telegram_chat_id
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/logout")
def logout():
    """Client tarafında token silme işlemi yapılır, sunucu sadece onay döner."""
    return {"message": "Başarıyla çıkış yapıldı."}
