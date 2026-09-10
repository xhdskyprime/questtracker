DROP TABLE IF EXISTS quests;
CREATE TABLE quests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  name TEXT NOT NULL,
  pic TEXT,
  handle TEXT,
  fee INTEGER,
  sow TEXT,
  timeline TEXT,
  keterangan TEXT,
  progress TEXT DEFAULT 'draft'
);

INSERT INTO quests (date, name, pic, handle, fee, sow, timeline, keterangan, progress) 
VALUES ('2023-10', 'Test Quest from D1', 'Nida', '@test', 150000, 'Test SOW', '2023-10-15', 'Keterangan test', 'posting');
