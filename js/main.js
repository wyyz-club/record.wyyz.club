// 假设我们有一个数组，包含了我们想在表格中展示的数据

var tableData = JSON.parse(localStorage.getItem('tableData')) || [];

// 可用的Bootstrap颜色类
const classes = [
    "table-primary", "table-secondary", "table-success",
    "table-danger", "table-warning", "table-info", "table-light"
];

let lastClass = '';  // 用来保持上一次添加的颜色类
let clickHandler = null

// 随机选择一个颜色类，但不能与上一个相同
function getRandomClass() {
    let newClass = classes[Math.floor(Math.random() * classes.length)];
    while (newClass === lastClass) {
        newClass = classes[Math.floor(Math.random() * classes.length)];
    }
    lastClass = newClass;
    return newClass;
}

// 截断文本并添加悬浮工具提示
function truncateText(text, length) {
    return text.length <= length ? text : `<span class="text-truncate" title="${text}">${text.substring(0, length)}...</span>`;
}

// 动态生成下拉选择框选项的函数
function generateSelectOptions(selectElement, options) {
    selectElement.innerHTML = ""; // 清空现有选项
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        selectElement.appendChild(opt);
    });
}

// 更新部位选择框
function updatePartsSelect() {
    const category = document.getElementById('categorySelect').value;
    const partsSelect = document.getElementById('partsSelect');
    partsSelect.innerHTML = ''; // 清空现有选项

    let partsOptions = [];
    if (category === '防具') {
        partsOptions = ['上衣', '下装', '腰带', '头肩', '鞋子'];
    } else if (category === '首饰') {
        partsOptions = ['手镯', '项链', '戒指'];
    } else if (category === '特殊') {
        partsOptions = ['左槽', '右槽', '耳环'];
    }

    partsOptions.forEach(part => {
        const option = document.createElement('option');
        option.value = part;
        option.textContent = part;
        partsSelect.appendChild(option);
    });

    updateSelectors(); // 更新其他选择器
}

// 初始化模态框和倒计时
function initializeModal() {
    const usageModal = new bootstrap.Modal(document.getElementById('usageModal'));
    let countdownInterval;
    const countdownText = document.getElementById('countdownText');

    if (!localStorage.getItem('noShowModalAgain')) {
        usageModal.show();
        let secondsLeft = 10;
        countdownText.innerText = `本提示将在 ${secondsLeft} 秒后自动关闭。`;

        countdownInterval = setInterval(() => {
            if (document.getElementById('disableAutoCloseCheck').checked) {
                clearInterval(countdownInterval);
                countdownText.innerText = '自动关闭已禁用。';
                return;
            }

            secondsLeft--;
            countdownText.innerText = `本提示将在 ${secondsLeft} 秒后自动关闭。`;
            if (secondsLeft <= 0) {
                clearInterval(countdownInterval);
                usageModal.hide();
            }
        }, 1000);
    }

    document.getElementById('noShowAgainCheck').addEventListener('change', (e) => {
        if (e.target.checked) {
            localStorage.setItem('noShowModalAgain', 'true');
        } else {
            localStorage.removeItem('noShowModalAgain');
        }
    });
}

// 保存数据并更新表格的函数
function saveData() {
    const role = document.getElementById('inputRole').value;
    const categorySelect = document.getElementById('categorySelect').value;
    const partsSelect = document.getElementById('partsSelect').value;
    const name = document.getElementById('inputName').value;
    const icon = icons[name + partsSelect]
    const attr1 = document.getElementById('selectAttr1').value;
    const attr2 = document.getElementById('selectAttr2').value;
    const attr3 = document.getElementById('selectAttr3').value;
    const attr4 = document.getElementById('selectAttr4').value;
    const remark = document.getElementById('inputRemark').value;
    const id = uuid.v4();

    if (role && categorySelect && partsSelect && name && attr1 && attr2 && attr3 && attr4 && remark) {
        tableData.push({id, role, categorySelect, partsSelect, name, icon, attr1, attr2, attr3, attr4, remark});
        localStorage.setItem('tableData', JSON.stringify(tableData));
        general("all");
        clearInputFields();
        populateAll()
        removeTableEditListener()
        addTableEditListener()
    } else {
        alert('请填写所有字段');
    }
}

// 清空输入框
function clearInputFields() {
    // document.getElementById('inputRole').value = '';
    document.getElementById('inputName').selectedIndex = 0;
    document.getElementById('categorySelect').selectedIndex = 0;
    document.getElementById('selectAttr1').selectedIndex = 0;
    document.getElementById('selectAttr2').selectedIndex = 0;
    document.getElementById('selectAttr3').selectedIndex = 0;
    document.getElementById('selectAttr4').selectedIndex = 0;
    // document.getElementById('inputRemark').value = '';
    updatePartsSelect();
}

// 用于更新表格的函数
function general(type, data = tableData) {
    const tbody = document.getElementById('myTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // 清空现有的表格内容
    var targetDataNew = type === 'filtered' ? data : tableData;

    if (type === 'all' || type === 'filtered') {
        targetDataNew.forEach((item, index) => appendRow(item, index));
    } else {
        const lastItem = targetDataNew[targetDataNew.length - 1];
        appendRow(lastItem, targetDataNew.length - 1);
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

// 向表格中添加一行
function appendRow(item, index) {
    const tbody = document.getElementById('myTable').getElementsByTagName('tbody')[0];
    const tr = document.createElement('tr');
    tr.className = getRandomClass(); // 随机颜色类
    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${truncateText(item.role, 10)}</td>
        <td>${item.categorySelect}</td>
        <td>${item.partsSelect}</td>
        <td>${item.name}</td>
        <td style="width: 20px"><img src="${icons[item.name + item.partsSelect]}" alt="图标"></td>
        <td class="text-truncate editable" title="${item.attr1}" id="${item.id}">${item.attr1}</td>
        <td class="text-truncate editable" title="${item.attr2}" id="${item.id}">${item.attr2}</td>
        <td class="text-truncate editable" title="${item.attr3}" id="${item.id}">${item.attr3}</td>
        <td class="text-truncate editable" title="${item.attr4}" id="${item.id}">${item.attr4}</td>
        <td class="text-truncate editable" title="${item.remark}" id="${item.id}">${item.remark}</td>
        <td>
            <i class="bi bi-trash-fill" style="cursor:pointer;" onclick="deleteRow('${item.id}')"></i>
        </td>
    `;
    tbody.appendChild(tr);
}

// 刷新页面的函数
function refreshPage() {
    window.location.reload();
}

// 删除行的函数
function deleteRow(targetId) {
    // 找到具有给定 UUID 的元素的索引
    const index = tableData.findIndex(item => item.id === targetId);
// 如果找到了元素，则从数组中移除它
    if (index !== -1) {
        tableData.splice(index, 1);
    }
    localStorage.setItem('tableData', JSON.stringify(tableData));
    refreshPage();
}

// 更新属性选择器的函数
function updateSelectors() {
    const attributes = allRandomEquipmentData; // 假定这是一个外部定义的数据对象
    const inputName = document.getElementById('inputName').value;
    const partsSelect = document.getElementById('partsSelect').value;
    const selected = inputName + partsSelect;

    const options = attributes[selected] || [];
    generateSelectOptions(document.getElementById('selectAttr1'), options);
    generateSelectOptions(document.getElementById('selectAttr2'), options);
    generateSelectOptions(document.getElementById('selectAttr3'), options);
    generateSelectOptions(document.getElementById('selectAttr4'), options);
}

// 导出数据
function exportData() {
    const dataStr = JSON.stringify(tableData);
    const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'all_data.txt';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// 导入数据
function importData() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                tableData = JSON.parse(e.target.result);
                checkData()
                refreshPage();
            } catch (error) {
                alert('文件内容格式错误！');
            }
        };
        reader.readAsText(file);
    }
}

// 动态填充属性筛选下拉框
function populateAttrFilter() {
    const attrSet = new Set();
    tableData.forEach(item => {
        ['attr1', 'attr2', 'attr3', 'attr4'].forEach(attr => {
            if (item[attr]) {
                attrSet.add(item[attr]);
            }
        });
    });

    const attrFilter = document.getElementById('attrFilter');
    attrFilter.innerHTML = '<option value="">所有属性</option>';
    attrSet.forEach(attr => {
        const option = document.createElement('option');
        option.value = attr;
        option.textContent = attr;
        attrFilter.appendChild(option);
    });
}

function populateRoleFilter() {
    const roleSet = new Set(tableData.map(item => item.role));
    const roleFilter = document.getElementById('roleFilter');
    roleFilter.innerHTML = '<option value="">所有角色</option>'; // 默认选项

    roleSet.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleFilter.appendChild(option);
    });
}

function populateLocationFilter() {
    const locationSet = new Set(tableData.map(item => item.partsSelect));
    const locationFilter = document.getElementById('locationFilter');
    locationFilter.innerHTML = '<option value="">所有部位</option>'; // 默认选项

    locationSet.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
}

function populateNameFilter() {
    const nameSet = new Set(tableData.map(item => item.name));
    const nameFilter = document.getElementById('nameFilter');
    nameFilter.innerHTML = '<option value="">所有名字</option>'; // 默认选项

    nameSet.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        nameFilter.appendChild(option);
    });
}

// 同时考虑角色和属性进行筛选
function filterTable() {
    const selectedRole = document.getElementById('roleFilter').value;
    const selectedAttr = document.getElementById('attrFilter').value;
    const selectedLocation = document.getElementById('locationFilter').value;
    const selectedName = document.getElementById('nameFilter').value;

    const filteredData = tableData.filter(item => {
        const roleMatch = selectedRole ? item.role === selectedRole : true;
        const attrMatch = selectedAttr ? [item.attr1, item.attr2, item.attr3, item.attr4].includes(selectedAttr) : true;
        const locationMatch = selectedLocation ? item.partsSelect === selectedLocation : true;
        const nameMatch = selectedName ? item.name === selectedName : true;
        return roleMatch && attrMatch && locationMatch && nameMatch;
    });

    general('filtered', filteredData);
    removeTableEditListener()
    addTableEditListener()
}


// 清空数据的函数
function clearData() {
    if (confirm('确定要清空所有数据吗？此操作不可撤销。')) {
        // 清空数据
        tableData = [];
        localStorage.setItem('tableData', JSON.stringify(tableData));
        localStorage.removeItem('noShowModalAgain');
        refreshPage(); // 刷新页面以更新视图
    }
}

function copyToClipboard() {
    // 将字典转换为字符串
    var text = JSON.stringify(tableData);

    // 创建临时文本区域
    var tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    tempTextArea.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);

    // 显示 Toasts
    var toastEl = document.getElementById('copyToast');
    var toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function populateAll() {
    populateRoleFilter();
    populateAttrFilter();
    populateLocationFilter();
    populateNameFilter()
}

function initializeScrollBottom() {
    document.getElementById('scrollTopBtn').addEventListener('click', function () {
        window.scrollTo({top: 0, behavior: 'smooth'});
    });

    document.getElementById('scrollBottomBtn').addEventListener('click', function () {
        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
    });
}

function generateUniqueId() {
    const timestamp = new Date().getTime(); // 当前时间的时间戳
    const randomNum = Math.floor(Math.random() * 1000); // 生成一个0到999的随机数
    return 'id_' + timestamp + '_' + randomNum; // 结合时间戳和随机数生成ID
}

function removeTableEditListener() {
    // 在需要移除事件监听器时，可以调用以下代码：
    document.querySelectorAll('.editable').forEach(cell => {
        cell.removeEventListener('click', clickHandler);
    });
}

function addTableEditListener() {
    clickHandler = function () {
        // 显示 Toasts
        let toastEl = document.getElementById('editToast');
        let toast = new bootstrap.Toast(toastEl);
        toast.show();
        // 确保单元格当前不是输入框
        if (this.querySelector('input')) return;

        let originalValue = this.innerText; // 存储原始值
        let uniqueId = this.getAttribute('id'); // 直接从 id 属性获取唯一 ID

        let input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue; // 使用原始值填充输入框
        input.className = 'form-control';

        this.innerHTML = '';
        this.appendChild(input);
        input.focus();

        const blurHandler = function () {
            let newValue = this.value;

            // 根据 id 查找字典数组中的相应字典项
            let editedItem = tableData.find(item => item.id === uniqueId);
            // 使用findIndex方法查找指定name的索引
            const editedIndex = tableData.findIndex(item => item.id === uniqueId);
            // 比较修改前的值和字典中的每个属性值
            let isModified = false;
            let editKey = "";
            for (let key in editedItem) {
                if (editedItem.hasOwnProperty(key) && editedItem[key] === originalValue) {
                    if (key === "role") {
                        continue
                    }
                    isModified = true;
                    editKey = key;
                    tableData[editedIndex][key] = newValue
                    localStorage.setItem('tableData', JSON.stringify(tableData));
                    populateAll()
                    // 显示 Toasts
                    let toastEl = document.getElementById('editSuccessToast');
                    let toast = new bootstrap.Toast(toastEl);
                    toast.show();
                    break;
                }
            }

            if (isModified) {
                console.log(`已修改 id 为 ${uniqueId} key 为 ${editKey} 的字典项的属性`);
            }

            if (editedItem) {
                let target = this.parentElement
                target.innerText = newValue;
                target.setAttribute("title", newValue); // 修改 title 属性
            }

            // 移除blur事件监听器
            input.removeEventListener('blur', blurHandler);
        };

        input.addEventListener('blur', blurHandler);
    };

    document.querySelectorAll('.editable').forEach(cell => {
        cell.addEventListener('click', clickHandler);
    });
}

function checkData() {

    // 遍历字典数组并添加ID
    tableData.forEach((item, index) => {
        if (!item.hasOwnProperty('id')) {
            item.id = uuid.v4();
        }
    });
    localStorage.setItem('tableData', JSON.stringify(tableData));
}

// 初始化页面和模态框
window.onload = function () {
    // 初始化模态框
    initializeModal();
    checkData()
    // 渲染表格数据
    general('all');
    initializeScrollBottom()
    populateAll()
    updatePartsSelect()

    addTableEditListener()
};
