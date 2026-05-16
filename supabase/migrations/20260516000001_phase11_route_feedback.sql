create or replace function public.save_route_feedback(input_feedback jsonb)
returns jsonb
language plpgsql
as $$
declare
  target_candidate_id uuid;
  saved_feedback_id uuid;
  saved_created_at timestamptz;
begin
  select route_candidates.id
  into target_candidate_id
  from public.route_candidates
  where route_candidates.candidate_id = input_feedback ->> 'routeCandidateId'
  order by route_candidates.created_at desc
  limit 1;

  if target_candidate_id is null then
    raise exception 'route candidate % was not found', input_feedback ->> 'routeCandidateId'
      using errcode = 'P0002';
  end if;

  insert into public.route_feedback (
    route_candidate_id,
    rating,
    tags,
    comment
  )
  values (
    target_candidate_id,
    input_feedback ->> 'rating',
    coalesce(input_feedback -> 'tags', '[]'::jsonb),
    nullif(input_feedback ->> 'comment', '')
  )
  returning id, created_at into saved_feedback_id, saved_created_at;

  return jsonb_build_object(
    'feedbackId', saved_feedback_id::text,
    'receivedAt', to_jsonb(saved_created_at) #>> '{}'
  );
end;
$$;
