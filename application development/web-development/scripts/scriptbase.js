const studentList = document.getElementById("studentListContainer");
const addButton = document.getElementById("addStudentButton");

const dummyStudents = [
    { name: "Edmund Mundl", age: 21, major: "Computer Science" },
    { name: "Josef Rohrmoser", age: 22, major: "Applied Geoinformatics" },
    { name: "Hansi Hinterseer", age: 20, major: "Spatial Analyst" },
    { name: "Max Mustermann", age: 23, major: "Psychology" },
    { name: "Frau Holle", age: 19, major: "DIG" }
];

let idx = 0;

addButton.addEventListener("click", () => {
    if (idx < dummyStudents.length) {
        const student = dummyStudents[idx];
        const li = document.createElement("li");
        li.textContent = `${student.name}, Age: ${student.age}, Major: ${student.major}`;
        studentList.appendChild(li);
        idx++;
    } else {
        alert("No more students to add!");
        if (idx >= dummyStudents.length) {
            addButton.remove();
        }
    }
});