// src/pages/HistoryPage.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getHistory } from '../api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  PieChart, Pie, Cell, Legend as PieLegend
} from 'recharts';
import {
  BarChart, Bar, CartesianGrid, Legend as BarLegend
} from 'recharts';

export default function HistoryPage() {
  const theme = useTheme();
  const [entries, setEntries] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');

  // Fetch and parse entries once
  useEffect(() => {
    getHistory().then(res => {
      const data = res.data.map(e => ({
        ...e,
        date: new Date(e.timestamp)
      }));
      setEntries(data);
    });
  }, []);

  // Filter entries by date range
  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (startDate && e.date < new Date(startDate)) return false;
      if (endDate   && e.date > new Date(endDate))   return false;
      return true;
    });
  }, [entries, startDate, endDate]);

  // Distribution pie
  const distribution = useMemo(() => {
    const counts = filtered.reduce((acc, e) => {
      acc[e.mood] = (acc[e.mood]||0)+1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name,value]) => ({ name, value }));
  }, [filtered]);

  // Weekly averages
  const weeklyData = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const d = e.date;
      const day = (d.getDay()+6)%7; // Mon=0...Sun=6
      const monday = new Date(d);
      monday.setDate(d.getDate()-day);
      const label = monday.toLocaleDateString('en-US');
      if (!groups[label]) groups[label]={sum:0,cnt:0};
      groups[label].sum+=e.compound;
      groups[label].cnt++;
    });
    return Object.entries(groups)
      .map(([weekStart,{sum,cnt}])=>({
        weekStart,
        average: parseFloat((sum/cnt).toFixed(3))
      }))
      .sort((a,b)=>new Date(a.weekStart)-new Date(b.weekStart));
  },[filtered]);

  // Monthly averages
  const monthlyData = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const d = e.date;
      const label = `${d.getMonth()+1}/${d.getFullYear()}`;
      if (!groups[label]) groups[label]={sum:0,cnt:0};
      groups[label].sum+=e.compound;
      groups[label].cnt++;
    });
    return Object.entries(groups)
      .map(([month,{sum,cnt}])=>({
        month,
        average: parseFloat((sum/cnt).toFixed(3))
      }))
      .sort((a,b)=>{
        const [mA,yA]=a.month.split('/').map(Number);
        const [mB,yB]=b.month.split('/').map(Number);
        return yA-yB||mA-mB;
      });
  },[filtered]);

  const pieColors = { happy:'#aed581', neutral:'#ffe082', sad:'#ef5350' };

  return (
    <Box sx={{ p:2, display:'flex', justifyContent:'center' }}>
      <Paper sx={{
        width:'100%', maxWidth:900, p:4,
        backgroundColor:
          theme.palette.mode==='light'
            ? 'rgba(255,255,255,0.8)'
            : 'rgba(0,0,0,0.75)',
        backdropFilter:'blur(8px)',
        boxShadow: theme.shadows[5],
        borderRadius:3
      }}>
        {/* Date Filters */}
        <Box sx={{ display:'flex', gap:2, mb:4, flexWrap:'wrap', alignItems:'center' }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={e=>setStartDate(e.target.value)}
            InputLabelProps={{ shrink:true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={e=>setEndDate(e.target.value)}
            InputLabelProps={{ shrink:true }}
          />
          <Button onClick={()=>{ setStartDate(''); setEndDate(''); }}>
            Reset
          </Button>
        </Box>

        {/* Mood Over Time */}
        <Typography
          variant="h4" gutterBottom
          sx={{
            color: theme.palette.text.primary,
            fontFamily: '"Cinzel Decorative", serif',
            textShadow:
              theme.palette.mode==='dark'
                ? '2px 2px 4px rgba(0,0,0,0.8)'
                : '1px 1px 2px rgba(255,255,255,0.6)'
          }}
        >
          Mood Over Time
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={filtered}>
            <XAxis
              dataKey="date"
              tickFormatter={d=>new Date(d).toLocaleDateString('en-US')}
              stroke={theme.palette.text.secondary}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              domain={[-1,1]}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary
              }}
            />
            <Line
              type="monotone"
              dataKey="compound"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r:3, fill:theme.palette.primary.main }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Mood Distribution */}
        <Typography
          variant="h5" gutterBottom sx={{ mt:4, color:theme.palette.text.primary, fontFamily:'"Cinzel Decorative", serif' }}
        >
          Mood Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={distribution}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              label
            >
              {distribution.map((e,i)=>(
                <Cell key={i} fill={pieColors[e.name.toLowerCase()]} />
              ))}
            </Pie>
            <PieLegend
              verticalAlign="bottom"
              formatter={v=>v.charAt(0).toUpperCase()+v.slice(1)}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ color:theme.palette.text.secondary }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Weekly Averages */}
        <Typography
          variant="h5" gutterBottom sx={{ mt:4, color:theme.palette.text.primary, fontFamily:'"Cinzel Decorative", serif' }}
        >
          Weekly Average Mood
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData} margin={{ top:5, right:30, left:0, bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.text.secondary}/>
            <XAxis dataKey="weekStart" stroke={theme.palette.text.secondary}/>
            <YAxis stroke={theme.palette.text.secondary} domain={[-1,1]}/>
            <Tooltip contentStyle={{ backgroundColor:theme.palette.background.paper, color:theme.palette.text.primary }}/>
            <Bar dataKey="average" fill={theme.palette.secondary.main}/>
            <BarLegend
              verticalAlign="bottom"
              payload={[{ value:'Avg Compound Score', type:'square', color:theme.palette.secondary.main }]}
              wrapperStyle={{ color:theme.palette.text.secondary }}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Monthly Averages */}
        <Typography
          variant="h5" gutterBottom sx={{ mt:4, color:theme.palette.text.primary, fontFamily:'"Cinzel Decorative", serif' }}
        >
          Monthly Average Mood
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top:5, right:30, left:0, bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.text.secondary}/>
            <XAxis dataKey="month" stroke={theme.palette.text.secondary}/>
            <YAxis stroke={theme.palette.text.secondary} domain={[-1,1]}/>
            <Tooltip contentStyle={{ backgroundColor:theme.palette.background.paper, color:theme.palette.text.primary }}/>
            <Bar dataKey="average" fill={theme.palette.primary.main}/>
            <BarLegend
              verticalAlign="bottom"
              payload={[{ value:'Avg Compound Score', type:'square', color:theme.palette.primary.main }]}
              wrapperStyle={{ color:theme.palette.text.secondary }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
