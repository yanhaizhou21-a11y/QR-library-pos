## 2026-09-11 - [Sentinel's First Log]
**Vulnerability:** Found a broken access control (BAC) / IDOR vulnerability on the `/borrow-as` endpoint where any authenticated user could act on behalf of another user.
**Learning:** Always verify that restricted endpoints correctly chain `adminRequired` with `authRequired`.
**Prevention:** Ensure new endpoints that mutate resources on behalf of other users have explicit admin/role checks.
