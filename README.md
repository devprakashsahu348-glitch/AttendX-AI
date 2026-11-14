# AttendX AI
Next.js 14 + Neon Postgres, hosted on Vercel. (c) Dev Prakash Sahu.

## Launch
1. Unzip, create a GitHub repo, upload the files, commit.
2. neon.tech: create a project, copy the connection string, open SQL Editor, paste `schema.sql`, run. (Already deployed earlier? Run the two `alter table` lines at the end.)
3. vercel.com: Import the repo, add the variables from `.env.example` (JWT_SECRET: `openssl rand -base64 32`), deploy.
4. Log in at /login with ADMIN_EMAIL and ADMIN_PASSWORD. That is the only admin account. The admin page shows a 404 to everyone else and is not linked for them.
5. When an institution emails you, open Admin panel, pick the plan, enter the number and months or years, click Activate.

## Free storage
Vercel Blob or Cloudinary (free tiers) for classroom photos. Not connected yet.

## Before real launch
- Vercel Hobby is for non-commercial use. Charging institutions needs Vercel Pro, or a host that allows commercial use on its free tier.
- Have a lawyer review Privacy and Terms (face data, minors, DPDP Act).
- Add your city/state for court jurisdiction, and an address or phone if you want one shown.
- Confirm final prices (current rates are the blueprint's examples).
- Automatic emails: Resend free tier. Today the "Email to continue" button opens the user's mail app.

## Camera
Face recognition runs in the browser (face-api, loaded from jsDelivr). Register each student's face with consent, then use Camera attendance. Matches under 0.45 are pre-ticked, 0.45 to 0.6 need a manual check, and nobody is marked absent automatically. Accuracy on a full classroom photo is limited: use good light and a close camera.

## Phases
1 and 2 (platform, photo attendance): done. 3: timetable and an in-app "next class" notice on the dashboard. 5: monthly report with CSV download and print/PDF, separate data per institution, plan control.
Run the new `create table timetable` line in Neon.

## CCTV
Direct RTSP cannot be read from a browser or from free serverless hosting. Free route: connect the DVR/NVR or IP camera to a school computer, expose it as a webcam (OBS Virtual Camera or the camera's webcam mode) and pick it from the camera list on the Camera attendance page. Always-on RTSP processing needs a small program on a school computer or a paid server: not built.

## Liveness, emails and notifications
- Liveness: registering a face needs the live camera and a blink. This stops a still photo, but a video replay of the student can still pass it. Never use face attendance alone for high-stakes decisions.
- Email (free): turn on 2-step verification on the Gmail account, create an App Password, and set GMAIL_USER and GMAIL_APP_PASSWORD. Gmail allows roughly 500 emails a day.
- Push: run `npx web-push generate-vapid-keys`, put the public key in NEXT_PUBLIC_VAPID_PUBLIC_KEY and the private key in VAPID_PRIVATE_KEY. On iPhone, add the site to the Home Screen first.
- Scheduler (free): in the GitHub repo open Settings > Secrets > Actions and add CRON_SECRET (same value as Vercel) and SITE_URL (your https://...vercel.app address). `.github/workflows/cron.yml` then calls the site every 10 minutes. Class reminders go out 5 to 25 minutes before a class; the monthly report goes out on the 1st of each month (India time). GitHub runs schedules on a best-effort basis, and pauses them on a public repo with no activity for 60 days.
- Run the new lines at the end of `schema.sql` in Neon.
- Test the monthly email at any time: open `SITE_URL/api/cron/monthly?month=2026-11` with the header `Authorization: Bearer CRON_SECRET`.

## Not built yet
An always-on CCTV reader (see CCTV above).
