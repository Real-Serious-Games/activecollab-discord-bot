'use strict';

import { Response, Request } from 'express';

import * as eventController from './event';

export function postActiveCollabWebhook(req: Request, res: Response) : void {
    let processed = eventController.processEvent(req.body);
    //TODO res.sendStatus(200)
    res.send(processed);
};
