const rootStyles = window.getComputedStyle(document.documentElement);

if (rootStyles.getPropertyValue('--book-cover-width-large') != null && rootStyles.getPropertyValue('--book-cover-width-large') !== '') {
	ready();
}
else {
	document.getElementById('main-css').addEventListener('load', ready);
}

function ready() {
	const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'));
	const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'));
	const coverHeight = coverWidth / coverAspectRatio;
	// This is original source code
	FilePond.registerPlugin(
		FilePondPluginImagePreview,
		FilePondPluginImageResize,
		FilePondPluginFileEncode,
	);
	// We register the plugins required to do
	// image previews, cropping, resizing, etc.
	/* FilePond.registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginImageCrop,
  FilePondPluginImageResize,
  FilePondPluginImageTransform,
  FilePondPluginImageEdit
);*/
	// Select the file input and use
	// create() to turn it into a pond
	/* FilePond.create(
  document.querySelector('input'),
  {
    labelIdle: `Drag & Drop your picture or <span class="filepond--label-action">Browse</span>`,
    imagePreviewHeight: 170,
    imageCropAspectRatio: '1:1',
    imageResizeTargetWidth: 200,
    imageResizeTargetHeight: 200,
    stylePanelLayout: 'compact circle',
    styleLoadIndicatorPosition: 'center bottom',
    styleProgressIndicatorPosition: 'right bottom',
    styleButtonRemoveItemPosition: 'left bottom',
    styleButtonProcessItemPosition: 'right bottom',
  }
);*/

	FilePond.setOptions({
		labelIdle: 'Плъзнете и пуснете вашата снимка или <span class="filepond--label-action">прегледайте</span>',
		stylePanelAspectRatio: 1 / coverAspectRatio,
		imageResizeTargetWidth: coverWidth,
		imageResizeTargetHeight: coverHeight,
	});

	FilePond.parse(document.body);
}