import * as request from 'supertest';
import * as express from 'express';

import { setupApp } from '../src/app';
import * as testData from './testData';
import { ApiControllerBuilder } from './builders/apiControllerBuilder';

const spoofKey: Buffer = Buffer.from(
    `-----BEGIN RSA PRIVATE KEY-----
    MIIEoQIBAAKCAQEA4fwD8HctmRm/shhTEndAHqiJm0uuRy7CsTRFT9D+GELd8WZC
    ovDqKLJtrOwc1cg2yh+Vi/V5DbaICRGf9cba0zSvuHamW6U69yP6tN/lIjVNi1O1
    IBPWLuw/Lp4/QfjEJoLf032k6Rp0DN7WqaOsBGo60GFklUeYGy1bfBA0bu7/PW9c
    4xOTBjXz/ro8IZDIJR5rUEedInn5ZWN3v2i4JV/+msy+PAxk3zZMaqllh9BTpjBI
    xNcVFTyb8Axg5xwDSzwVQClVY4yFY9/8/ZGCu1w7ljdXTWbc2Y/DN6Oz2TyqZwcK
    r/Bp2YsSFCdWT2Z0421PEmhzBqw7xlFer0xnSQIDAQABAoIBAEwuVfGha4i6KmpS
    UubdtorfTAxDFgw/EjkEov0GOjJZkFJJo9skFfwEMn7h1dKnvPikbxiQdu+Nggx0
    mZUUJT6f+0DXFru8VsVrpp+E/sxqZaq7XErlBQYqdB42EKMfxpgo9GVqbMZ8OXUB
    RiJH37xZR1xqCKteSEOZJccL+3ENlGOc7/8EtVlPKSySM8uUVu9Fyg7m33ElTXZM
    3LiRNqF0bdH3DfR/uJe8Adj/oivGqsM2mouCy2qpDZnk7PRkaA6j6fFEK11oi0vd
    suoa+s4yf9RuRJpmTyLNZd2MY1UbLo634ehc0EgotQvgUCTQ3sgGSbJ4SlKeUh/A
    OjiuetECgYEA9Gfl/tZkib5ktz1R9zViX63oEW3sLBPstQ2Hx0ZyudLFraOl6ad6
    ElUBN0L4SjYFuq5yH5RSQVJNfjXs5TFfxEz5Jiz2rdJM55bG0akEGxcmLDgC0vZv
    Cj1SqP0KhcLwQrleMsBPJGFgQd5iO6kVvjEtyGrFX2y5FOLkwAFtmy0CgYEA7LRn
    jGBcEPxml9LmXtWhdAXVProaepHi2xx4FX92UkbvAVgO8yE/AhJjCwQZ9X5YxLkb
    2QDnAgZMMcwH7Ydwh2b3IlLqY2pQ4pFIyMsgk8Oe+8NQxD97QIzSP1sBXRF15z63
    hHgk5YO+P696yEvx9Ov2zou2KdO3j51CNdllXg0CgYEAiHzpVVp3RPE9n5MwDgUT
    Dem5mtovNSJfY3DN7bxq31lUqbalNgogQtKT3j+ZFyB6LJm1A+u5z97dhekphYkA
    OUjfLrGXhNTXu9FY8McZkuNnnvQcp6GVuzspyVOep7qIoEqSz3bT+7YhokdFxpmT
    meYu8iimVrcJ2R8org1eH3UCgYBvRX9H5iRhd8ViqanR+usi93r/Oc0owVu7VO6+
    bGTa2K2SHCsq7/4Go04b55msZfCkyb/lix8NPJik8Bzp9DlZ7XVPlVrJ0TikyVdF
    zPdLfzJFd9OH7a+q8IgFcGp7rbGXO0xZ4YC2w++zUHKPpePgFuy2u8aucvBferWd
    Ssz0IQJ/dkO0EMEmypdIkuX8t5GWGAIG9WNM6R0dshW/2WkhRt+82lKov1yGcj7w
    anVUyN1XL+zXsQmTOd2WkY0gCP/0ZZ7ouVAVGzPn8Rs9SapjQbMNqpw2umvEKISL
    IfSCJYaUNHcvqQ29gaKSrDfu1397WzRDdCf4E6QNCe4F2Jr/Gw==
    -----END RSA PRIVATE KEY-----
    `
);

const spoofCert: Buffer = Buffer.from(
    `-----BEGIN CERTIFICATE-----
    MIIDWzCCAkOgAwIBAgIJAL26ctaLA5UaMA0GCSqGSIb3DQEBBQUAMEQxQjBABgNV
    BAMMOWFjdGl2ZWNvbGxhYi1kaXNjb3JkLWJvdC5hdXN0cmFsaWFlYXN0LmNsb3Vk
    YXBwLmF6dXJlLmNvbTAeFw0xODA4MTAwMTIxMzVaFw0yODA4MDcwMTIxMzVaMEQx
    QjBABgNVBAMMOWFjdGl2ZWNvbGxhYi1kaXNjb3JkLWJvdC5hdXN0cmFsaWFlYXN0
    LmNsb3VkYXBwLmF6dXJlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
    ggEBAOH8A/B3LZkZv7IYUxJ3QB6oiZtLrkcuwrE0RU/Q/hhC3fFmQqLw6iiybazs
    HNXINsoflYv1eQ22iAkRn/XG2tM0r7h2plulOvcj+rTf5SI1TYtTtSAT1i7sPy6e
    P0H4xCaC39N9pOkadAze1qmjrARqOtBhZJVHmBstW3wQNG7u/z1vXOMTkwY18/66
    PCGQyCUea1BHnSJ5+WVjd79ouCVf/prMvjwMZN82TGqpZYfQU6YwSMTXFRU8m/AM
    YOccA0s8FUApVWOMhWPf/P2RgrtcO5Y3V01m3NmPwzejs9k8qmcHCq/wadmLEhQn
    Vk9mdONtTxJocwasO8ZRXq9MZ0kCAwEAAaNQME4wHQYDVR0OBBYEFN4v0foxHnbO
    bQ7NrlYKBP3F78fkMB8GA1UdIwQYMBaAFN4v0foxHnbObQ7NrlYKBP3F78fkMAwG
    A1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAErFxKXBQRQLAVLuADc1ojSj
    oYvJi4PZVRT0YWV4hFG8eqwY68Aa457a8+0Vkf5cz+JNwP2WHDGZvqdq3YveY9Kl
    7k0rPmp11K8RXw1uvVMm/bjwGF4Tqwea//5kMOnYVXUxUp/heGU78/akxXtC3EQH
    p/1KqupuxkNCmHp/kaPmHJzcBOHmoz6uDwc/Z1zIVmxwqE91eerIkQJ599Eifdpq
    z2UVowEWsXcaib0wSBJeaEanOL3KqzBMM1f58mba8XTS8l1Ikek2/bDAJovjT3n3
    Tz07FcLOlCzj0SE9DpOgNd2he9CzzTAm2NL4hhuLUj2FCNTyT+u5eUxK8pq6MxE=
    -----END CERTIFICATE-----
    `
);

describe('POST /api/webhook', () => {
    it('should return status 200 when webhook secret present', (done) => {
        const webhookSecret = 'secret';

        const app = express();

        const apiController = new ApiControllerBuilder()
            .withWebhookSecret(webhookSecret)
            .build();

        setupApp(app, apiController, spoofKey, spoofCert);

        return request(app)
            .post('/api/webhook')
            .set('X-Angie-WebhookSecret', webhookSecret)
            .send(testData.getRawNewComment())
            .end(function (err, res) {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('should return status 403 when missing webhook secret', (done) => {
        const webhookSecret = 'secret';

        const app = express();

        const apiController = new ApiControllerBuilder()
            .withWebhookSecret(webhookSecret)
            .build();

        setupApp(app, apiController, spoofKey, spoofCert);

        return request(app)
            .post('/api/webhook')
            .send(testData.getRawNewTask())
            .end(function (err, res) {
                expect(res.status).toEqual(403);
                done();
            });
    });
});