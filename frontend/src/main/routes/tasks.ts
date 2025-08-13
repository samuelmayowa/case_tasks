import express, { Application, Request, Response } from 'express';
import fetch from 'node-fetch';

const apiBase = process.env.API_BASE_URL || 'http://localhost:4000';

export default function(app: Application): void {
  app.get('/tasks', async (req: Request, res: Response) => {
    const r = await fetch(`${apiBase}/api/tasks`);
    const tasks = await r.json();
    res.render('tasks.njk', { tasks });
  });

  app.post('/tasks', express.urlencoded({ extended: true }), async (req: Request, res: Response) => {
    const body = {
      title: req.body.title,
      description: req.body.description || undefined,
      status: req.body.status || 'todo',
      dueDate: req.body.dueDate
    };
    await fetch(`${apiBase}/api/tasks`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    res.redirect('/tasks');
  });

  app.post('/tasks/:id/status', express.urlencoded({ extended: true }), async (req: Request, res: Response) => {
    await fetch(`${apiBase}/api/tasks/${req.params.id}/status`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: req.body.status }) });
    res.redirect('/tasks');
  });

  app.post('/tasks/:id/delete', async (req: Request, res: Response) => {
    await fetch(`${apiBase}/api/tasks/${req.params.id}`, { method: 'DELETE' });
    res.redirect('/tasks');
  });
}