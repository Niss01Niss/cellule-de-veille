import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase.from('client_profiles').select('*');
        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;
    case 'POST':
      try {
        const { name, email, status } = req.body;
        const { data, error } = await supabase.from('client_profiles').insert([{ name, email, status }]);
        if (error) throw error;
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;
    case 'PUT':
      try {
        const { id, updates } = req.body;
        const { data, error } = await supabase.from('client_profiles').update(updates).eq('id', id);
        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.body;
        const { error } = await supabase.from('client_profiles').delete().eq('id', id);
        if (error) throw error;
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
