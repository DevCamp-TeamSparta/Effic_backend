export interface SlackConfig {
  alarmUrl: string;
}

export const slackConfig: SlackConfig = {
  alarmUrl: process.env.SLACK_ALARM,
};
