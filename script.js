
//--------------------------
// To Do List App
// version 0.1.1-beta 
//-------------------------- 

var i;
var date = new Date();
var lastTap = 0; // tap timer:
var key = 'todo'; // default key name for local storage
var locale =  'en-US'; // default language-country code
var listname = 'To Do List'; // default list name
var myItems = JSON.parse(localStorage.getItem('todo'));
var contextMenu = CtxMenu('#tdlMyList');

// page elements
const heading = document.getElementById('heading')
const list = document.getElementById('tdlMyList');
const input = document.getElementById('editorContainer');
const errmsg = document.getElementById('errmsg');
const fileInput = document.getElementById('backupFile');
const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
const successModal = new bootstrap.Modal(document.getElementById('successModal'));

// theme
//window.tSiteTheme = localStorage.getItem('tSiteTheme') || 'Normal'
// light, dark, or OS default mode
//window.tSiteMode = localStorage.getItem('tSiteMode') || 'os'

// empty list message
var elm = `<h4 class="text-center mt-5">There are no list items to display</h4>
<div class="text-center">(You can add some using the form above)</div>
<div class="text-center mt-4">
  <button class="btn btn-lg btn-secondary shadow" onclick="loadSampleData()">Or, Load Sample Data</button>
</div>
`;

/* enables URL parameters (see below for usage)
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
*/

// detect if local storage is available from MDN web docs
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === "QuotaExceededError" &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}
// handle custom right click stuff
	contextMenu.addItem("Edit item content",
		function(){
			//
		},
		Icon = "info.svg"
	);
	contextMenu.addItem("Toggle item check",
		function(){
			location.reload();
		},
		Icon = "info.svg"
	);
	// Add a seperator
	contextMenu.addSeperator();

	// Add a second item to the menu, this time with an icon


	contextMenu.addItem("More Item Here",
		function(){
			//
		},
		Icon = "info.svg"
	);


// display the list
function showList() {

    // retrieve list data from local storage
    //const getData =  localStorage.getItem(key);
    // if we have data, 
    if (localStorage.getItem('todo')) {
        // parse it
        myItems = JSON.parse(localStorage.getItem('todo'));
        // check if the array has data
        if (Array.isArray(myItems) && myItems.length) {
            // populate with actual data (from local storage)
            for (i = 0; i < myItems.length; i++) {
                list.innerHTML += `
     <li class="tdlToDoListItem ${myItems[i].status === 'completed' ? 'checked ' : ''}list-group-item" data-id="${myItems[i].id}">
            <div class="container-fluid m-0 p-0">
              <div class="d-flex flex-row align-items-center">
                <div class="p-2 flex-grow-1 tdlItemText" translate="no">${myItems[i].text}</div>
                <div class="p-2 d-none d-md-flex me-3 date" title="Date created">${showFriendlyDate(myItems[i].created)}</div>
                <div class="p-1 d-none d-sm-flex justify-content-center align-items-center mx-3">
                <div class="d-flex flex-row justify-content-end align-items-center">
                 <!-- edit/delete buttons (large screen)-->
                  <div class="me-2">
                   <button class="btn btn-sm btn-success rounded lsbtn" onclick="editItem('${myItems[i].id}')" data-bs-toggle="modal" data-bs-target="#editModal" title="Edit"><i class="bi bi-pencil-square"></i></button>
                  </div>
                 <div class="me-2">
                    <button class="btn btn-sm btn-danger rounded lsbtn" onclick="removeItem('${myItems[i].id}')" title="Delete"><i class="bi bi-x-circle-fill"></i></button>
                  </div>
               </div>
             </div>
                <!-- drag handle (for drag-and-drop) -->
                <i class="drag-handle bi bi-grip-vertical" title="Drag to change list order"></i>
           </div>
              <div class="container-fluid d-sm-none text-center my-2">
                <!-- edit/delete buttons (small screen) -->
                <button class="btn btn-success rounded smbtn" onclick="editItem('${myItems[i].id}')" data-bs-toggle="modal" data-bs-target="#editModal" title="Edit"><i class="bi bi-pencil-square"></i> Edit</button>
               <button class="btn btn-danger rounded smbtn" onclick="removeItem('${myItems[i].id}')" title="Delete"><i class="bi bi-x-circle-fill"></i> Delete</button>
              </div>
         </div></li>\n`;
       }
            // update the UI
            //list.innerHTML = html;
        }
        // array is empty, show empty list message
        else {
            errmsg.innerHTML = elm;
        }
    } else {
        // no data? show empty list message
        errmsg.innerHTML = elm;
    }
    // build node list after all list items are displayed
    const listItems = document.querySelectorAll('li');
    // if a user double clicks (or taps), toggle 'checked' class
    listItems.forEach(item => {
        item.addEventListener('dblclick', function() {
            this.classList.toggle('checked');
            toggleStatus(this.dataset.id);
        });
        item.addEventListener('touchend', function() {
            var currentTime = date.getTime();
            var tapLength = currentTime - lastTap;
            if (tapLength < 300) {
                // double tap detected!
                this.preventDefault();
                this.classList.toggle('checked');
                toggleStatus(this.dataset.id);
            }
            lastTap = currentTime;
        });
    });
    // load SortableJS library
    var sortable = Sortable.create(list, {
        ghostClass: 'bordered-item', // show dashed border while dragging
        handle: '.drag-handle', // enable drag handle target image
        onStart: function(evt) {
            evt.item.style.opacity = '0.5'; // set opacity to 50% while dragging
        },
        onEnd: function(evt) {
            evt.item.style.opacity = '1'; // after drag is done, reset opacity 
            reorderItems(); // and reorder items in local storage
        }
    });
    // focus the input field
    input.focus();
    // allow user to press Enter instead of clicking the button
    input.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("addBtn").click();
        }
    });
}
showList();
function deleteListData() {
  localStorage.clear();
  location.reload();
}
// create new list item
function addItem(item) {
    // get the text input
    var inputValue = item || input.getElementsByClassName("hr-editor")[0];
    // if form is blank, show an error
    if (inputValue.textContent.trim() == '') {
        Swal.fire("You didn't type anything!");
        return false;
    } else {
        // otherwise, write value to local storage
        saveData(inputValue.innerHTML);
        // and reload the page
        location.reload();
    }
}

// save item to local storage
function saveData(val) {

    // we have data in local storage
    if (localStorage.getItem('todo')) {
        // parse it
        var dataArr = JSON.parse(localStorage.getItem('todo'));
        // if we have a valid array,
        if (Array.isArray(dataArr) && dataArr.length) {
            // get last id used
            const lastID = dataArr.length > 1 ? dataArr[dataArr.length - 1].id : dataArr[0].id;
            // create new object containing input value
            const newdata = {
                "id": lastID + 1,
                "text": val,
                "created": date.toISOString(),
                "updated": date.toISOString(),
                "status": "active"
            };
            // push new object to list array
            dataArr.push(newdata);
            // and write to local storage
            localStorage.setItem('todo', JSON.stringify(dataArr));
        }
        // array is empty
        else {
            createFirstItem(val);
        }
    }
    // no data in local storage
    else {
        createFirstItem(val);
    }
}

// remove item (both from DOM and local storage)
function removeItem(id) {
    if (confirm("Do you want to delete this item?") == true) {
        // retrieve existing data
        const dataArr = localStorage.getItem('todo');
        // if we have data,
        if (dataArr) {
            // parse it
            let pdArr = JSON.parse(dataArr);
            // convert id string to an integer
            const intId = parseInt(id, 10);
            // compare id to ids in the array and remove the item
            pdArr = pdArr.filter(item => item.id !== intId);
            // write data back to local storage
            localStorage.setItem('todo', JSON.stringify(pdArr));
            // remove li element from DOM
            //const liToRemove = document.querySelector(`li[data-id="${intId}"]`);
            //if (liToRemove) {liToRemove.remove();}
            // and reload the page
            location.reload();
        }
    } else {
        return false;
    }
}

// edit the text of existing list items
function editItem(id) {
    // convert the id to an integer
    const intId = parseInt(id, 10);
    // retrieve array from local storage
    let todoList = JSON.parse(localStorage.getItem('todo'));
    // check if todoList is not null and is an array
    if (Array.isArray(todoList) && todoList.length > 0) {
        // find the item by id
        let selectedItem = todoList.find(item => item.id === intId);
        // if we have an item,
        if (selectedItem) {
            // populate modal with text from local storage
            document.getElementById('message-text').value = selectedItem.text;
            // add event listener to save button
            document.getElementById('saveBtn').addEventListener('click', function() {
                // grab textarea value
                const newText = document.getElementById('message-text').value;
                // we have new text (if it's not equal to stored value)
                if (selectedItem.text !== newText) {
                    // update stored text
                    selectedItem.text = newText;
                    // change 'updated' date
                    selectedItem.updated = date.toISOString();
                    // and save to local storage
                    localStorage.setItem('todo', JSON.stringify(todoList));
                    // then reload the page
                    location.reload();
                }
                // text has not changed
                else {
                    // close the modal
                    var myModal = new bootstrap.Modal(document.getElementById('editModal'));
                    myModal.hide();
                }
            }, {
                once: true
            }); // <== this prevents multiple event listeners 
        }
    }
}

// reoroder items in local storage when user drags and drops list items
function reorderItems() {
    const liElements = Array.from(document.querySelectorAll('li'));
    const data = JSON.parse(localStorage.getItem('todo'));
    const newData = [];
    liElements.forEach((li) => {
        const id = parseInt(li.getAttribute('data-id'));
        const item = data.find((obj) => obj.id === id);
        newData.push(item);
    });
    localStorage.setItem('todo', JSON.stringify(newData));
}

// create first item (if array is empty)
function createFirstItem(val) {
    // create a new empty array
    let item = [];
    // create a new object containing the input value
    const newdata = {
        "id": 1,
        "text": val,
        "created": date.toISOString(),
        "updated": date.toISOString(),
        "status": "active"
    };
    // push object to the new array
    item.push(newdata);
    // and write to local storage
    localStorage.setItem('todo', JSON.stringify(item));
    location.reload();
}

// toggle status of item
function toggleStatus(id) {
    // Retrieve array from local storage
    let todoList = JSON.parse(localStorage.getItem('todo'));
    // Find the item with the corresponding ID
    let item = todoList.find(item => item.id === parseInt(id));
    // Toggle the status between "active" and "completed"
    item.status = item.status === 'active' ? 'completed' : 'active';
    // Update array in localstorage
    localStorage.setItem('todo', JSON.stringify(todoList));
}

// format ISO dates to local format
function showFriendlyDate(d) {
    return new Date(d).toLocaleDateString(locale);
}

// backup data from local storage
function backupListData() {
    // try to get the data
    const data = localStorage.getItem('todo');
    if (data) {
        const jsonData = JSON.stringify(JSON.parse(data), null, 2);
        const blob = new Blob([jsonData], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        // get the current date in the specified locale format
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        const formattedDate = new Intl.DateTimeFormat(locale, options).format(date);
        // replace invalid file name characters in the date
        const validDate = formattedDate.replace(/\//g, '-');
        // construct the file name with the key and the formatted date
        const fileName = `todo-${validDate}.json`;
        // create a link and trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // revoke the object URL
        URL.revokeObjectURL(url);
        // show the success modal screen
        successModal.show();
    } else {
        // show the error modal screen
        errorModal.show();
        Swal.fire(`No data found for the key: ${key}`);
    }
}

// restore data - save uploaded JSON file to local storage
function importListData() {
    const file = fileInput.files[0];
    if (file) {
        if (file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const fileData = e.target.result;
                    localStorage.setItem('todo', fileData);
                    location.reload();
                } catch (error) {
                    // show an error modal
                    errorModal.show();
                    Swal.fire('Error saving file to local storage: ' + error);
                    return false;
                }
            }
            reader.readAsText(file);
        } else {
            // show an error modal
            errorModal.show();
            Swal.fire('Invalid file type! Please upload a valid .json backup file.');
            return false;
        }
    } else {
        // show an error modal
        errorModal.show();
        Swal.fire('No file was selected.');
        return false;
    }
}

// load sample data
function loadSampleData() {
    let item = [
        {
            "id": 1,
            "text": "Type a new item and click 'Add Item' (or press Enter)",
            "created": date.toISOString(),
            "updated": date.toISOString(),
            "status": "active"
        },
        {
            "id": 2,
            "text": "Drag the handle icon on the right to reorder list items",
            "created": date.toISOString(),
            "updated": date.toISOString(),
            "status": "active"
        },
        {
            "id": 3,
            "text": "Double click (or tap) an item to mark as 'completed'",
            "created": date.toISOString(),
            "updated": date.toISOString(),
            "status": "active"
        },
        {
            "id": 4,
            "text": "Click the 'Edit' button to edit an item",
            "created": date.toISOString(),
            "updated": date.toISOString(),
            "status": "active"
        },
        {
            "id": 5,
            "text": "To delete an item click the 'Delete' button",
            "created": date.toISOString(),
            "updated": date.toISOString(),
            "status": "completed"
        }
    ];
    // save sample data to local storage
    localStorage.setItem('todo', JSON.stringify(item));
    // and reload the page
    location.reload();
}

/* how to use URL parameters: (e.g. index.html?foo=bar)
if (params.foo) {
    console.log('The URL parameter foo = ' + params.foo);
}*/

