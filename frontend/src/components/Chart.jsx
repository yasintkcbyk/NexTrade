import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

export default function Chart({ data }) {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Grafiği oluştur ve koyu temamıza uygun renkleri ayarla
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af', // text-gray-400
      },
      grid: {
        vertLines: { color: '#334155' }, // border-slate-700
        horzLines: { color: '#334155' },
      },
      width: chartContainerRef.current.clientWidth || 600, // Genişlik 0 ise 600px varsay (çökmeyi önler)
      height: 400,
    });

    // Profesyonel Mum Grafiğine (Candlestick) geçiş yapıyoruz
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candlestickSeries.setData(data);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-[400px]" />;
}
