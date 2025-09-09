-- Enable RLS
alter table pets enable row level security;
alter table sightings enable row level security;
alter table reward_claims enable row level security;
alter table user_push_tokens enable row level security;
alter table emergency_broadcasts enable row level security;
alter table referrals enable row level security;
alter table pet_verification_attempts enable row level security;
alter table suspicious_activities enable row level security;
alter table feeding_records enable row level security;
alter table rescue_channels enable row level security;
alter table rescue_tasks enable row level security;
alter table content_reports enable row level security;
alter table analytics_events enable row level security;
alter table circles enable row level security;
alter table circle_members enable row level security;
alter table circle_posts enable row level security;

-- Example policies (tighten as needed)
-- Pets: owner can CRUD own pets; public can select with limited columns via RPCs only.
create policy pets_owner_rw on pets for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Sightings: reporters can insert; owners can view; others read-only via RPC.
create policy sightings_insert on sightings for insert with check (auth.uid() = reporter_id);
create policy sightings_owner_select on sightings for select using (
  exists (
    select 1 from pets p where p.id = pet_id and p.owner_id = auth.uid()
  ) or auth.uid() = reporter_id
);

-- Reward claims: claimer/owner can see/update own rows.
create policy reward_claims_rw on reward_claims for all using (
  auth.uid() = claimer_id or auth.uid() = owner_id
) with check (
  auth.uid() = claimer_id or auth.uid() = owner_id
);

-- Push tokens: user can manage own tokens.
create policy user_tokens_rw on user_push_tokens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Others: restrict to owner/reporters; adapt as needed.
create policy feeding_records_rw on feeding_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Rescue channels/tasks policies
create policy rescue_channels_owner_rw on rescue_channels for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy rescue_tasks_rw on rescue_tasks for all using (
  auth.uid() = assignee OR exists (select 1 from rescue_channels c where c.id = rescue_tasks.channel_id and c.owner_id = auth.uid())
) with check (auth.uid() = assignee OR exists (select 1 from rescue_channels c where c.id = rescue_tasks.channel_id and c.owner_id = auth.uid()));

-- Content reports: reporter can insert; admins (owner_id in pets) can read pet-level
create policy content_reports_insert on content_reports for insert with check (auth.uid() = reporter_id);
create policy content_reports_select on content_reports for select using (
  exists (select 1 from pets p where p.id = content_reports.pet_id and p.owner_id = auth.uid()) OR auth.uid() = reporter_id
);

-- Analytics: user can insert own events
create policy analytics_events_insert on analytics_events for insert with check (auth.uid() = user_id);

-- Circles
create policy circles_rw on circles for all using (auth.uid() = created_by) with check (auth.uid() = created_by);
create policy circle_members_rw on circle_members for all using (auth.uid() = user_id OR exists (select 1 from circles c where c.id = circle_id and c.created_by = auth.uid())) with check (auth.uid() = user_id OR exists (select 1 from circles c where c.id = circle_id and c.created_by = auth.uid()));
create policy circle_posts_rw on circle_posts for all using (auth.uid() = author_id OR exists (select 1 from circle_members m where m.circle_id = circle_id and m.user_id = auth.uid())) with check (auth.uid() = author_id OR exists (select 1 from circle_members m where m.circle_id = circle_id and m.user_id = auth.uid()));

-- NOTE: Consider removing blanket SELECT; prefer exposing via secure RPCs (get_pets_with_privacy).
