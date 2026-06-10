import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';
import { Settings, BarChart2, TrendingUp } from 'lucide-react';

export default function Chart({ data, signals = [] }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const mainSeriesRef = useRef(null);

  const [chartType, setChartType] = useState('candle'); // 'candle' | 'line'
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
    }

    const container = chartContainerRef.current;
    const height = container.clientHeight || 400;
    const width  = container.clientWidth  || 800;

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
        rightOffset: 12,
      },
      handleScale: { mouseWheel: true, pinch: true },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
    });

    chartRef.current = chart;

    let mainSeries;
    if (chartType === 'candle') {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#0ecb81',
        downColor: '#f6465d',
        borderUpColor: '#0ecb81',
        borderDownColor: '#f6465d',
        wickUpColor: '#0ecb81',
        wickDownColor: '#f6465d',
      });
    } else {
      mainSeries = chart.addLineSeries({
        color: '#4488ff',
        lineWidth: 2,
        crosshairMarkerVisible: true,
      });
    }
    mainSeriesRef.current = mainSeries;

    const formattedData = data
      .filter(d => d.open && d.high && d.low && d.close)
      .map(d => {
        let time = d.time;
        if (typeof time === 'string') time = Math.floor(new Date(time).getTime() / 1000);
        return {
          time,
          open: parseFloat(d.open),
          high: parseFloat(d.high),
          low: parseFloat(d.low),
          close: parseFloat(d.close),
          value: parseFloat(d.close) // LineSeries için
        };
      })
      .filter(d => !isNaN(d.time) && !isNaN(d.close))
      .sort((a, b) => a.time - b.time);

    const seen = new Set();
    const uniqueData = formattedData.filter(d => {
      if (seen.has(d.time)) return false;
      seen.add(d.time);
      return true;
    });

    if (uniqueData.length > 0) {
      mainSeries.setData(uniqueData);

      if (signals && signals.length > 0) {
        const seenArray = Array.from(seen).sort((a, b) => a - b);
        const findNearestTime = (signalTime) => {
          let ts = typeof signalTime === 'string' ? Math.floor(new Date(signalTime + 'T00:00:00Z').getTime() / 1000) : signalTime;
          if (seenArray.length === 0) return null;
          let nearest = null, minDiff = Infinity;
          for (const t of seenArray) {
            const diff = Math.abs(t - ts);
            if (diff < minDiff) { minDiff = diff; nearest = t; }
          }
          return minDiff <= 3 * 86400 ? nearest : null;
        };

        const markers = signals.map(s => {
          const matchedTime = findNearestTime(s.time);
          if (!matchedTime) return null;
          return {
            time: matchedTime, position: s.position || 'belowBar', color: s.color || '#4488ff', shape: s.shape || 'arrowUp', text: s.text || ''
          };
        }).filter(Boolean).sort((a, b) => a.time - b.time);

        const uniqueMarkers = markers.filter((m, i, arr) => i === 0 || m.time !== arr[i - 1].time);
        if (uniqueMarkers.length > 0) mainSeries.setMarkers(uniqueMarkers);
      }

      chart.timeScale().fitContent();
    }

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && container) chartRef.current.resize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, signals, chartType]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      {/* Chart Toolbar */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: 8 }}>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
          title="Grafik Ayarları"
        >
          <Settings size={16} />
        </button>

        {showSettings && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(15,23,42,0.85)', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}>
            <button onClick={() => setChartType('candle')} style={{ background: chartType === 'candle' ? 'rgba(68,136,255,0.2)' : 'transparent', color: chartType === 'candle' ? 'var(--accent-blue)' : 'var(--text-muted)', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
              <BarChart2 size={14} /> Mum
            </button>
            <button onClick={() => setChartType('line')} style={{ background: chartType === 'line' ? 'rgba(68,136,255,0.2)' : 'transparent', color: chartType === 'line' ? 'var(--accent-blue)' : 'var(--text-muted)', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
              <TrendingUp size={14} /> Çizgi
            </button>
          </div>
        )}
      </div>

      <div
        ref={chartContainerRef}
        style={{ width: '100%', flex: 1, minHeight: 0 }}
      />
    </div>
  );
}
