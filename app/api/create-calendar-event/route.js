import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { accessToken, summary, startDateTime, duration, attendeeEmail } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      )
    }

    // Set up Google Calendar API
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Calculate end time
    const startTime = new Date(startDateTime)
    const endTime = new Date(startTime.getTime() + duration * 60000) // duration in minutes

    // Create calendar event
    const event = {
      summary: summary || 'Therapy Session',
      description: 'Scheduled therapy session via Heed Psychology App',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/New_York', // You can make this configurable
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
      conferenceData: {
        createRequest: {
          requestId: `heed-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    }

    // Insert the event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all' // Send email invitations
    })

    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || 
                    response.data.hangoutLink || 
                    null

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      meetLink: meetLink,
      eventLink: response.data.htmlLink
    })

  } catch (error) {
    console.error('Calendar API Error:', error)
    
    if (error.code === 401) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create calendar event', details: error.message },
      { status: 500 }
    )
  }
}