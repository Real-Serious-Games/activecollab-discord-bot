import { IActiveCollabRestClient } from '../../src/controllers/activecollab-rest';

export class RestClientMockBuilder {
        private get = jest.fn();
        private post = jest.fn();

        public withGet(mock: jest.Mock) {
            this.get = mock;
            return this;
        }

        public withPost(mock: jest.Mock) {
            this.post = mock;
            return this;
        }

        public build(): IActiveCollabRestClient {
            return {
                get: this.get,
                post: this.post
            };
        }
    }