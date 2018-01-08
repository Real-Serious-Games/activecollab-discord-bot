'use strict';

import { Response, Request } from 'express';

export let postActiveCollabWebhook = (req: Request, res: Response) => {
  res.send(req.body);
};
