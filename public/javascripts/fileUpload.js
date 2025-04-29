// This is the original source code
/*
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
//	FilePond.setOptions({
//		labelIdle: 'Плъзнете и пуснете вашата снимка или <span class="filepond--label-action">прегледайте</span>',
//		stylePanelAspectRatio: 1 / coverAspectRatio,
//		imageResizeTargetWidth: coverWidth,
//		imageResizeTargetHeight: coverHeight,
//	});
//
//	FilePond.parse(document.body);
// }
// This is the new source code

function initializeFilePond() {
	// Check if all required components are loaded
	if (!window.FilePond || !window.FilePondPluginImagePreview) {
	  console.error('FilePond dependencies not loaded');
	  return;
	}

	// Register plugins
	FilePond.registerPlugin(
	  FilePondPluginImagePreview,
	  FilePondPluginImageResize,
	  FilePondPluginFileValidateType,
	);

	// Create instance
	const pond = FilePond.create(document.querySelector('input.filepond'), {
	  acceptedFileTypes: ['image/*'],
	  maxFileSize: '5MB',
	  labelIdle: 'Плъзнете и пуснете снимка или <span class="filepond--label-action">Изберете</span>',
	  server: {
			process: {
		  url: '/upload/process',
		  onload: (response) => {
					const result = JSON.parse(response);
					document.getElementById('coverImagePath').value = result.filePath;
					document.getElementById('thumbnailPath').value = result.thumbPath;
					return result.filePath;
		  },
			},
	  },
	});

	return pond;
}

// Try initializing when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
	// Retry every 100ms if not loaded yet
	const interval = setInterval(() => {
	  if (window.FilePond) {
			clearInterval(interval);
			initializeFilePond();
	  }
	}, 100);

	// Timeout after 5 seconds
	setTimeout(() => {
	  clearInterval(interval);
	  if (!window.FilePond) {
			console.error('FilePond failed to load after 5 seconds');
	  }
	}, 5000);
});
