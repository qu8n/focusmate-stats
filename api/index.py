
from api.helpers.time import get_start_of_week_local_datetime, \
    local_datetime_to_utc_datetime, datetime_to_query_str, ms_to_minutes
from api.helpers.request import get_session_id_from_cookie, get_access_token_from_db
from api.helpers.focusmate import fetch_focusmate_data, fm_sessions_data_to_df
import os
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from dotenv import load_dotenv


app = FastAPI()
load_dotenv()


fm_api_profile_endpoint = os.getenv("NEXT_PUBLIC_FM_API_PROFILE_ENDPOINT")
fm_api_sessions_endpoint = os.getenv("NEXT_PUBLIC_FM_API_SESSIONS_ENDPOINT")


@app.get("/api/py/profile")
async def profile(request: Request):
    session_id = get_session_id_from_cookie(request)
    access_token = get_access_token_from_db(session_id)
    profile_data = fetch_focusmate_data(
        fm_api_profile_endpoint, access_token).get("user")
    return {"data": profile_data}


@app.get("/api/py/sessions")
async def sessions(request: Request):
    session_id = get_session_id_from_cookie(request)
    access_token = get_access_token_from_db(session_id)

    profile_data = fetch_focusmate_data(
        fm_api_profile_endpoint, access_token)

    local_timezone: str = profile_data.get("user").get("timeZone")

    start_of_week = get_start_of_week_local_datetime(local_timezone)
    start_of_week_utc = local_datetime_to_utc_datetime(
        start_of_week, local_timezone)
    start_of_week_query_str = datetime_to_query_str(start_of_week_utc)

    now_utc = datetime.now(timezone.utc)
    now_utc_query_str = datetime_to_query_str(now_utc)

    query_params = {
        "start": start_of_week_query_str,
        "end": now_utc_query_str
    }

    sessions_data: list = fetch_focusmate_data(
        fm_api_sessions_endpoint, access_token, query_params).get("sessions")

    all_sessions = fm_sessions_data_to_df(sessions_data, local_timezone)
    sessions = all_sessions[all_sessions['completed'] == True].copy()

    total_sessions = len(sessions)
    total_session_minutes = ms_to_minutes(sessions['duration'].sum())

    total_partners = len(sessions['partner_id'].unique())
    partner_session_counts = sessions['partner_id'].value_counts()
    total_repeat_partners = len(
        partner_session_counts[partner_session_counts > 1])

    earliest_session_time = sessions['start_time'].dt.time.min()
    latest_session_time = sessions['start_time'].dt.time.max()
    most_common_session_time = sessions['start_time'].dt.time.mode(
    ).iloc[0]

    total_duration_by_date = sessions.groupby(
        sessions['start_time'].dt.date)['duration'].sum()
    daily_avg_minutes = ms_to_minutes(total_duration_by_date.mean())
    daily_median_minutes = ms_to_minutes(total_duration_by_date.median())
    daily_record_minutes = ms_to_minutes(total_duration_by_date.max())

    sessions['join_diff'] = sessions['start_time'] - sessions['joined_at']
    avg_join_diff_seconds = int(
        sessions['join_diff'].mean().total_seconds())

    return {
        "total": {
            "total_sessions": total_sessions,
            "total_session_minutes": total_session_minutes,
            "total_partners": total_partners,
            "total_repeat_partners": total_repeat_partners
        },
        "time": {
            "earliest_session_time": earliest_session_time,
            "latest_session_time": latest_session_time,
            "most_common_session_time": most_common_session_time
        },
        "daily": {
            "daily_avg_minutes": daily_avg_minutes,
            "daily_median_minutes": daily_median_minutes,
            "daily_record_minutes": daily_record_minutes
        },
        "avg_join_diff_seconds": avg_join_diff_seconds,
        # "df": sessions_df.to_dict(orient='records')
    }
