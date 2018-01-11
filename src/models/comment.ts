'use strict';

import { Event } from './event';

export interface Comment extends Event {
    payload: {
        id: number,
        class: string,
        url_path: string,
        parent_type: string,
        parent_id: number,
        body: string,
        created_on: number,
        created_by_id: number
    };
}