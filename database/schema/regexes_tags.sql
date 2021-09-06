DROP TABLE IF EXISTS regexes_tags CASCADE;

CREATE TABLE regexes_tags (
  regex_id INTEGER NOT NULL REFERENCES regexes(id),
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(regex_id, tag_id)
);