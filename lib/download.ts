import JSZip from 'jszip';

export function downloadSingleSVG(svg: string, name: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${name.toLowerCase().replace(/\s+/g, '-')}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadMultipleSVGs(
  illustrations: Array<{ svg: string; name: string }>
) {
  const zip    = new JSZip();
  const folder = zip.folder('strokiy-illustrations');

  illustrations.forEach(({ svg, name }) => {
    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.svg`;
    folder?.file(filename, svg);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `strokiy-${illustrations.length}-illustrations.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadIllustrations(
  illustrations: Array<{ svg: string; name: string }>
) {
  if (illustrations.length === 1) {
    downloadSingleSVG(illustrations[0].svg, illustrations[0].name);
  } else {
    await downloadMultipleSVGs(illustrations);
  }
}
