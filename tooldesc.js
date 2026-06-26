const gmailToolDeclaration = {
  functionDeclarations: [
    {
      name: "sendMails",
      description: "Sends emails to multiple users.",
      parameters: {
        type: "object",
        properties: {
          mailList: {
            type: "array",
            items: {
              type: "string",
            },
            description: "An array of recipients mails.",
          },
          subject: {
            type: "string",
            description: "Subject of the mail.",
          },
          body: {
            type: "string",
            description: "Body of the mail, only html format, even newlines expects <br>",
          },
        },
        required: ["mailList", "subject", "body"],
      },
    },
    {
      name: "lists_messages",
      description:
        "Lists unread Gmail messages for the authenticated user matching optional search filters.",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description:
              "The user's email address. The special value 'me' indicates the authenticated user.",
            default: "me",
          },
          q: {
            type: "string",
            description:
              "Optional search query to refine unread messages (e.g., 'from:boss@company.com').",
            default: "is:unread",
          },
        },
        required: ["userId", "q"],
      },
    },
    {
      name: "read_message_details",
      description:
        "Retrieves the sender, subject, body, and headers of a specific Gmail message by its messageID.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique immutable ID of the message to retrieve.",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "trash_gmail_message",
      description:
        "Moves a specific Gmail message to the trash folder using its message ID.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description:
              "The unique alphanumeric ID of the Gmail message to trash.",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "trash_automation",
      description:
        "To initiate a process that deletes unwanted/unuseful mails.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "read_contacts_list",
      description:
        "gets a list of contacts with name and mail address.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "save_contact",
      description:
        "saves a new contact with name and email address.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "name of contact, can be firstname from mail address",
          },
          mailAddress: {
            type: "string",
            description: "mail address of the contact.",
          },
        },
        required: ["name", "mailAddress"],
      },
    },
  ],
};

const commandToolDeclaration = {
  functionDeclarations: [
    {
      name: "execute_commands",
      description:
        "execute any command in the windows command prompt like create folders/file, read/write files etc.. in current directory as root.",
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

const categoryToolDeclaration = {
  functionDeclarations: [
    {
      name: "save_category",
      description:
        "saves the category of the mail",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "category of mail, expects one of 'Promotional','Rejection','Other'.",
          },
        },
        required: ["category"],
      },
    },
  ],
};

export { gmailToolDeclaration, commandToolDeclaration, categoryToolDeclaration };
