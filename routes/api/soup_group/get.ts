import { withDb } from "lib/middleware/with-db"
import { withRouteSpec } from "lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  queryParams: z.object({
    soup_group_name: z.string(),
  }),
  jsonResponse: z.object({
    soup_groups: z.array(
      z.object({ soup_group_name: z.string(), created_at: z.string() }),
    ),
  }),
})(async (req, ctx) => {
  return ctx.json({
    soup_groups: [],
  })
})
