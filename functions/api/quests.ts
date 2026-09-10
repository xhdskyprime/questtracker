export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM quests ORDER BY id DESC"
    ).all();
    
    return Response.json(results);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json<any>();
    
    const { success } = await context.env.DB.prepare(
      "INSERT INTO quests (date, name, pic, handle, fee, sow, timeline, keterangan, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      body.date || '',
      body.name || '',
      body.pic || '',
      body.handle || '',
      body.fee || 0,
      body.sow || '',
      body.timeline || '',
      body.keterangan || '',
      body.progress || 'draft'
    ).run();

    if (success) {
      return Response.json({ success: true, message: "Quest added!" }, { status: 201 });
    } else {
      return Response.json({ error: "Failed to insert quest" }, { status: 400 });
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
