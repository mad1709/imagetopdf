document.addEventListener('DOMContentLoaded', (event) => {
    let selectedFiles = []; // Biến toàn cục để lưu trữ file

    const fileInput = document.getElementById('image-input');
    const fileListContainer = document.getElementById('file-list-container');
    
    const dragOverlay = document.createElement('div');
    dragOverlay.className = 'drag-overlay';
    dragOverlay.textContent = 'Drop here';
    document.body.appendChild(dragOverlay);

    let isDragging = false; // Biến cờ để theo dõi trạng thái kéo

    document.body.addEventListener('dragenter', (event) => {
        isDragging = true;
        dragOverlay.style.visibility = 'visible';
    });

    document.body.addEventListener('dragover', (event) => {
        event.preventDefault(); // Ngăn chặn hành vi mặc định
        isDragging = true;
    });

    document.body.addEventListener('dragleave', (event) => {
        // Kiểm tra xem có phải đang rời khỏi body không
        if (event.relatedTarget === null) {
            isDragging = false;
            setTimeout(() => {
                if (!isDragging) {
                    dragOverlay.style.visibility = 'hidden';
                }
            }, 100); // Đợi một khoảng thời gian ngắn để kiểm tra lại trạng thái kéo
        }
    });

    document.body.addEventListener('drop', (event) => {
        event.stopPropagation();
        event.preventDefault();
        isDragging = false;
        dragOverlay.style.visibility = 'hidden';
        selectedFiles = event.dataTransfer.files; // Lưu trữ file được kéo vào
        displayFileList(selectedFiles);
    });

    // Sự kiện change cho fileInput
    fileInput.addEventListener('change', (event) => {
        selectedFiles = event.target.files; // Cập nhật selectedFiles khi chọn file qua hộp thoại
        displayFileList(selectedFiles);
    });

    // Sự kiện drop cho toàn bộ trang
    function isValidFileType(file) {
        const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Thêm các loại file khác nếu cần
        return acceptedTypes.includes(file.type);
    }
    // Sự kiện dragover cho toàn bộ trang
    document.body.addEventListener('dragover', (event) => {
        event.preventDefault();
        isDragging = true;
    
        const file = event.dataTransfer.items[0];
        if (file && isValidFileType(file)) {
            dragOverlay.classList.add('valid');
            dragOverlay.classList.remove('invalid');
            dragOverlay.textContent = 'Drop mic here';
        } else {
            dragOverlay.classList.add('invalid');
            dragOverlay.classList.remove('valid');
            dragOverlay.textContent = 'File not accepted';
        }
    
        dragOverlay.style.visibility = 'visible';
    });
    
    function resetDragOverlay() {
        isDragging = false;
        dragOverlay.classList.remove('valid', 'invalid'); // Loại bỏ các lớp trạng thái
        dragOverlay.textContent = 'Drop mic here';
        dragOverlay.style.visibility = 'hidden';
    }
    
    document.body.addEventListener('drop', (event) => {
        event.stopPropagation();
        event.preventDefault();
        selectedFiles = event.dataTransfer.files; // Lưu trữ file được kéo vào
        displayFileList(selectedFiles);
    });


    function displayFileList(files) {
        fileListContainer.innerHTML = '';
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const fileContainer = document.createElement('div');
                fileContainer.className = 'file-display';
    
                const deleteButton = document.createElement('span');
                deleteButton.textContent = 'X';
                deleteButton.className = 'delete-button';
                deleteButton.onclick = function() { removeFile(index); };
    
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.className = 'image-preview';
                img.onload = function() {
                    URL.revokeObjectURL(this.src);
                };
    
                const fileName = document.createElement('span');
                fileName.textContent = formatFileName(file.name);
                fileName.className = 'file-name';
    
                fileContainer.appendChild(deleteButton);
                fileContainer.appendChild(img);
                fileContainer.appendChild(fileName);
    
                fileListContainer.appendChild(fileContainer);
            }
        });
    }
    
    function formatFileName(name) {
        const maxLength = 6;
        const extensionIndex = name.lastIndexOf('.');
        const extension = name.substring(extensionIndex + 1);
        let shortName = name.substring(0, extensionIndex);
    
        if (shortName.length > maxLength) {
            shortName = shortName.substring(0, maxLength) + '***';
        }
    
        return `${shortName}.${extension}`;
    }
    
    
    
    // Hàm xóa file khỏi danh sách
    function removeFile(index) {
        selectedFiles = Array.from(selectedFiles).filter((_, i) => i !== index);
        displayFileList(selectedFiles);
    }
    
    


document.getElementById('convert-single-button').addEventListener('click', function() {
    const input = document.getElementById('image-input');
    const images = selectedFiles;
    if (images.length === 0) {
        alert('Please select at least one photo!');
        return;
    }

    let pdf = null;
    let count = 0;

    const loadImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    resolve(img);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const processImages = async () => {
        for (const file of images) {
            const img = await loadImage(file);
            const imgWidth = img.width;
            const imgHeight = img.height;
            const widthInMm = imgWidth * 0.264583;
            const heightInMm = imgHeight * 0.264583;

            if (!pdf) {
                pdf = new jspdf.jsPDF({
                    orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: [widthInMm, heightInMm]
                });
            } else {
                pdf.addPage([widthInMm, heightInMm], imgWidth > imgHeight ? 'landscape' : 'portrait');
            }

            pdf.addImage(img, 'JPEG', 0, 0, widthInMm, heightInMm);
        }
        pdf.save('combined.pdf');
    };

    processImages();
});


document.getElementById('convert-multiple-button').addEventListener('click', function() {
    const input = document.getElementById('image-input');
    const images = selectedFiles;
    if (images.length === 0) {
        alert('Please select at least one image!');
        return;
    }
   Array.from(images).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const imgWidth = img.width;
                const imgHeight = img.height;
                const widthInMm = imgWidth * 0.264583;
                const heightInMm = imgHeight * 0.264583;
                const pdf = new jspdf.jsPDF({
                    orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: [widthInMm, heightInMm]
                });

                pdf.addImage(img, 'JPEG', 0, 0, widthInMm, heightInMm);

                // Lấy tên của file ảnh gốc (loại bỏ phần mở rộng)
                const originalFileName = file.name.replace(/\.[^/.]+$/, "");
                
                // Tạo một thẻ <a> để tải xuống và kích hoạt sự kiện click để tự động tải xuống
                const link = document.createElement('a');
                link.href = pdf.output('bloburl');
                link.download = `${originalFileName}.pdf`;
                link.click();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
});
});