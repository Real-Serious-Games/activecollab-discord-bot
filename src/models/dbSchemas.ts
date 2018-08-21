import { prop, Typegoose } from 'typegoose';

export class UserSchema extends Typegoose {
    @prop()
    discordId?: string;
    @prop({ required: true })
    activeCollabId!: number;
    @prop({ required: true })
    activeCollabName!: string;
    @prop({ required: true })
    dailyReportSubs!: string[];
}

export class ChannelSchema extends Typegoose {
    @prop({ required: true })
    projectId!: number;
    @prop()
    channelName?: string;
    @prop()
    guildIndex?: number;
}

export class ImageSchema extends Typegoose {
    @prop({ required: true })
    type!: string;
    @prop({ required: true })
    fileName!: string;
    @prop({ required: true })
    data!: Buffer;
}