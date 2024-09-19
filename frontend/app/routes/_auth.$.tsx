import { LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const filePath = params["*"];

  return json({ filePath });
}


export async function action({ params }: ActionFunctionArgs) {
  // const filePath = params["*"];


  return json({ });
}

const FourOhFour = () => {
  const { filePath } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>404</h1>
      <p>Could not find /a/{filePath}</p>
    </div>
  );
};

export default FourOhFour;
