import { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';

export default function Chart({ data, signals = [] }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Önceki chart'ı temizle
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const height = container.clientHeight || 400;
    const width  = container.clientWidth  || 800;

    // Chart oluştur
    const chart = createChart(container, {
      width,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#8ba4c8',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(99,179,237,0.05)', style: LineStyle.Dashed },
        horzLines: { color: 'rgba(99,179,237,0.05)', style: LineStyle.Dashed },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(100,116,139,0.5)', labelBackgroundColor: '#1e293b', style: LineStyle.Dotted, width: 1 },
        horzLine: { color: 'rgba(100,116,139,0.5)', labelBackgroundColor: '#1e293b', style: LineStyle.Dotted, width: 1 },
      },
      rightPriceScale: {
        borderColor: 'rgba(99,179,237,0.1)',
        textColor: '#8ba4c8',
        autoScale: true,
      },
      timeScale: {
        borderColor: 'rgba(99,179,237,0.1)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12, // Binancedeki gibi sağda boşluk bırakır
      },
      handleScale: { mouseWheel: true, pinch: true },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
    });

    chartRef.current = chart;

    // Candlestick serisi
    const candleSeries = chart.addCandlestickSeries({
      upColor:          '#0ecb81', // Binance green
      downColor:        '#f6465d', // Binance red
      borderUpColor:    '#0ecb81',
      borderDownColor:  '#f6465d',
      wickUpColor:      '#0ecb81',
      wickDownColor:    '#f6465d',
    });

    // Mum verilerini normalize et
    const formattedData = data
      .filter(d => d.open && d.high && d.low && d.close)
      .map(d => {
        // Zaman UNIX timestamp olarak gelmeli (saniye)
        let time = d.time;
        if (typeof time === 'string') {
          time = Math.floor(new Date(time).getTime() / 1000);
        }
        return {
          time,
          open:  parseFloat(d.open),
          high:  parseFloat(d.high),
          low:   parseFloat(d.low),
          close: parseFloat(d.close),
        };
      })
      .filter(d => !isNaN(d.time) && !isNaN(d.open))
      .sort((a, b) => a.time - b.time);

    // Duplicate time'ları filtrele
    const seen = new Set();
    const uniqueData = formattedData.filter(d => {
      if (seen.has(d.time)) return false;
      seen.add(d.time);
      return true;
    });

    if (uniqueData.length > 0) {
      candleSeries.setData(uniqueData);
      candleSeriesRef.current = candleSeries;

      // Volume histogramı (alt)
      const volumeSeries = chart.addHistogramSeries({
        color: '#4488ff',
        priceFormat: { type: 'volume' },
        priceScaleId: '', // Attach to overlay
        scaleMargins: { top: 0.85, bottom: 0 },
      });

      const volumeData = uniqueData.map(d => ({
        time: d.time,
        value: data.find(r => {
          let rt = r.time;
          if (typeof rt === 'string') rt = Math.floor(new Date(rt).getTime() / 1000);
          return rt === d.time;
        })?.volume || 0,
        color: d.close >= d.open ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)',
      }));

      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;

      // Sinyal işaretleyicileri (AL/SAT)
      if (signals && signals.length > 0) {
        const markers = signals
          .map(s => {
            let time = s.time;
            if (typeof time === 'string') time = Math.floor(new Date(time).getTime() / 1000);
            if (!seen.has(time)) return null;
            return {
              time,
              position: s.position || 'belowBar',
              color: s.color || '#4488ff',
              shape: s.shape || 'arrowUp',
              text: s.text || '',
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.time - b.time);

        if (markers.length > 0) {
          candleSeries.setMarkers(markers);
        }
      }

      chart.timeScale().fitContent();
    }

    // Responsive resize
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && container) {
        chartRef.current.resize(container.clientWidth, container.clientHeight);
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, signals]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: '100%', height: '100%', minHeight: 0 }}
    />
  );
}
