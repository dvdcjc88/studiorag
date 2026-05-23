---
description: Fetch and explain a YouTube video transcript
argument-hint: <youtube-url>
allowed-tools: Bash(yt-dlp:*), Bash(uvx:*), Read
---

Fetch the transcript for this YouTube video and explain it: $ARGUMENTS

Steps:
1. Run `yt-dlp --write-auto-sub --write-sub --sub-lang en --skip-download --sub-format vtt -o "/tmp/yt-%(id)s.%(ext)s" "$ARGUMENTS"` to download subtitles
2. Read the resulting .vtt file from /tmp/
3. Strip the VTT timestamps and formatting to get clean text
4. Provide:
   - 2-3 sentence TL;DR
   - Key points as a short list
   - Any notable quotes or claims worth flagging
   
If no subtitles exist, tell me and stop — don't try to transcribe audio.
