export interface Env {
  DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id;
    if (!id) return Response.json({ error: "ID is required" }, { status: 400 });

    const body = await context.request.json<any>();
    
    const { success } = await context.env.DB.prepare(
      "UPDATE quests SET date = ?, name = ?, pic = ?, handle = ?, fee = ?, sow = ?, timeline = ?, keterangan = ?, progress = ? WHERE id = ?"
    ).bind(
      body.date || '',
      body.name || '',
      body.pic || '',
      body.handle || '',
      body.fee || 0,
      body.sow || '',
      body.timeline || '',
      body.keterangan || '',
      body.progress || 'draft',
      id
    ).run();

    if (success) {
      return Response.json({ success: true, message: "Quest updated!" });
    } else {
      return Response.json({ error: "Failed to update quest" }, { status: 400 });
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id;
    if (!id) return Response.json({ error: "ID is required" }, { status: 400 });

    const { success } = await context.env.DB.prepare(
      "DELETE FROM quests WHERE id = ?"
    ).bind(id).run();

    if (success) {
      return Response.json({ success: true, message: "Quest deleted!" });
    } else {
      return Response.json({ error: "Failed to delete quest" }, { status: 400 });
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
