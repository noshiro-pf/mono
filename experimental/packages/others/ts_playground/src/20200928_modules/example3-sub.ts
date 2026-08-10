declare module '*!text' {
  const content: string;
  export default content;
}
// Some do it the other way around.
declare module 'json!*' {
  const value: any;
  export default value;
}
