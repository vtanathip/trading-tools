/**
 * Type declarations for importing CSS files
 */
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
