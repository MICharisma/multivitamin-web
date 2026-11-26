import { createHashRouter, Navigate } from "react-router"
import { registry } from "../registry"
import { ExampleRoute } from "./ExampleRoute"
import { MultivitaminIndex } from "./MultivitaminIndex"
import { MultivitaminLayout } from "./MultivitaminLayout"
import { NotFound } from "./NotFound"

/**
 * Hash routing keeps the site fully static: any host can serve `index.html` and deep links
 * like `#/rubyllm/01-chat-basics/01-bengaluru-inverter-board?step=3` still resolve.
 */
export const router = createHashRouter([
  { path: "/", element: <Navigate replace to={`/${registry[0]?.id ?? ""}`} /> },
  {
    path: "/:multivitamin",
    element: <MultivitaminLayout />,
    children: [
      { index: true, element: <MultivitaminIndex /> },
      { path: ":feature/:example", element: <ExampleRoute /> },
    ],
  },
  { path: "*", element: <NotFound /> },
])
