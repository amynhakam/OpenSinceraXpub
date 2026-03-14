// Vercel Serverless Function - Ecosystem Proxy
const SINCERA_API_BASE = 'https://open.sincera.io/api';
const SINCERA_TOKEN = process.env.SINCERA_TOKEN || 'c54dc3e17898500ecab43e76ba24bf';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Build query string from request
        const params = new URLSearchParams();
        if (req.query.start_date) params.append('start_date', req.query.start_date);
        if (req.query.end_date) params.append('end_date', req.query.end_date);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        const response = await fetch(`${SINCERA_API_BASE}/ecosystem${queryString}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SINCERA_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: `API Error: ${response.status}` });
        }
        
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
