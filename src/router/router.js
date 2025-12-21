export const loadModule = async (path, container) => {
  const res = await fetch(`../modules/${path}`);
  container.innerHTML = await res.text();
};
