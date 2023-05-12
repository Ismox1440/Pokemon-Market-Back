import { GetVerificationKey, expressjwt as expressjwt } from "express-jwt";
import jwks from "jwks-rsa";

export const jwtCheck = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri:
      "https://dev-lbu2ncq4c7wy2sqz.us.auth0.com/.well-known/jwks.json",
  }) as GetVerificationKey,
  audience: "https://dev-lbu2ncq4c7wy2sqz.us.auth0.com/api/v2/",
  algorithms: ["RS256"],
});

