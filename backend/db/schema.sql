-- tabs: one row per currently open tab (deleted on tab close, see cleanup_service.py)
create table if not exists tabs (
    tab_id      bigint primary key,
    window_id   bigint,
    title       text,
    url         text,
    active      boolean,
    last_accessed timestamptz
);

-- dom_data: one row per tab, populated lazily, replaced on navigation
create table if not exists dom_data (
    tab_id      bigint primary key references tabs(tab_id) on delete cascade,
    inner_text  text,
    interactive_elements jsonb,
    extracted_at timestamptz
);

-- screenshots: one row per tab, only present when a tier-3 action needed vision
create table if not exists screenshots (
    tab_id      bigint primary key references tabs(tab_id) on delete cascade,
    image_url   text,
    captured_at timestamptz
);
