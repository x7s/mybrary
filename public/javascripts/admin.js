function confirmDelete(publisherId) {
	Swal.fire({
		title: 'Сигурни ли сте?',
		text: 'Това действие не може да бъде отменено!',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#d33',
		cancelButtonColor: '#3085d6',
		confirmButtonText: 'Да, изтрий!',
		cancelButtonText: 'Отказ',
	}).then((result) => {
		if (result.isConfirmed) {
			fetch(`/admin/publishers/${publisherId}?confirm=true`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
				},
				credentials: 'same-origin',
			}).then(response => {
				if (response.ok) {
					window.location.reload();
				}
				else {
					Swal.fire('Грешка!', 'Неуспешно изтриване', 'error');
				}
			});
		}
	});
}
