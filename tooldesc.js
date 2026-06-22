const calendarToolDeclaration = {
  functionDeclarations: [
    {
      name: "list_agenda_7_days",
      description:
        "List your events for all your calendars over the next 7 days.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "list_calendar_agenda",
      description: "List events from a specific calendar.",
      parameters: {
        type: "object",
        properties: {
          calendar_name: {
            type: "string",
            description:
              "The name of the specific calendar is always udayganguru2000@gmail.com.",
          },
        },
        required: ["calendar_name"],
      },
    },
    {
      name: "display_weekly_calendar",
      description: "Display an ASCII calendar of events by week.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "display_monthly_calendar",
      description: "Display an ASCII calendar of events for a month.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "quick_add_event",
      description: "Quick-add an event to a specified calendar.",
      parameters: {
        type: "object",
        properties: {
          calendar_name: {
            type: "string",
            description:
              "The name of the calendar is always udayganguru2000@gmail.com",
          },
          date: {
            type: "string",
            description: "The date of the event in mm/dd format.",
          },
          time: {
            type: "string",
            description: "The time of the event in HH:MM format.",
          },
          event_name: {
            type: "string",
            description: "The title/name of the event.",
          },
        },
        required: ["calendar_name", "date", "time", "event_name"],
      },
    },
  ],
};

const commandToolDeclaration = {
  functionDeclarations: [
    {
      name: "execute_commands",
      description:
        "execute any command in the windows command prompt like create folders/file, read/write files etc.. in current folder.",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "command to execute on windows command prompt",
          },
        },
        required: ["command"],
      },
    },
  ],
};

export { calendarToolDeclaration, commandToolDeclaration };
