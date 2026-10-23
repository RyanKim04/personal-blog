declare module "*.ipynb" {
  const notebook: import("@/lib/notebook").Notebook;
  export default notebook;
}
declare module "*.webm" {
  const src: string;
  export default src;
}
declare module "*.mp4" {
  const src: string;
  export default src;
}
declare module "plotly.js-basic-dist-min";
