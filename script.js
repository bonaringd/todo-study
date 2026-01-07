// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    push, 
    set, 
    onValue, 
    remove, 
    update,
    off
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDaRaFFr0nj08NcjILlPz_1Ns48hyibMGw",
    authDomain: "bonaringr-todo-backend.firebaseapp.com",
    projectId: "bonaringr-todo-backend",
    storageBucket: "bonaringr-todo-backend.firebasestorage.app",
    messagingSenderId: "69346428694",
    appId: "1:69346428694:web:745530c1e1df1e61a2f237",
    databaseURL: "https://bonaringr-todo-backend-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('✅ Firebase 초기화 성공:', app.name);
    console.log('✅ Realtime Database 연결:', db);
} catch (error) {
    console.error('❌ Firebase 초기화 실패:', error);
    alert('Firebase 연결에 실패했습니다. 콘솔을 확인해주세요.');
}

// 할일 데이터 저장
let todos = [];
let currentFilter = 'all';

// DOM 요소
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

// 이벤트 리스너
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTodos();
    });
});

// 할일 추가 (Firebase Realtime Database 사용)
async function addTodo() {
    const text = todoInput.value.trim();
    
    // 입력값 검증
    if (text === '') {
        alert('할일을 입력해주세요!');
        return;
    }
    
    // Firebase 연결 확인
    if (!db) {
        alert('Firebase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
        console.error('Realtime Database가 초기화되지 않음');
        return;
    }
    
    // 중복 추가 방지 (버튼 비활성화)
    addBtn.disabled = true;
    addBtn.textContent = '추가 중...';
    
    try {
        console.log('📝 할일 추가 시도:', text);
        console.log('📦 Realtime Database:', db);
        
        // Firebase Realtime Database에 할일 데이터 생성
        const todo = {
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        console.log('📤 전송할 데이터:', todo);
        
        // Realtime Database 'todos' 경로에 데이터 추가
        const todosRef = ref(db, 'todos');
        const newTodoRef = push(todosRef);
        await set(newTodoRef, todo);
        
        console.log('✅ 할일이 Firebase Realtime Database에 성공적으로 추가되었습니다. 키:', newTodoRef.key);
        
        // 성공 시 입력창 초기화
        todoInput.value = '';
        todoInput.focus();
    } catch (error) {
        console.error('❌ Firebase 할일 추가 실패:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        
        let errorMessage = '할일 추가에 실패했습니다.\n\n';
        
        if (error.code === 'PERMISSION_DENIED') {
            errorMessage += '⚠️ Realtime Database 보안 규칙 문제입니다.\n\n';
            errorMessage += '📋 해결 방법:\n';
            errorMessage += '1. Firebase 콘솔 접속: https://console.firebase.google.com\n';
            errorMessage += '2. 프로젝트 선택: bonaringr-todo-backend\n';
            errorMessage += '3. 왼쪽 메뉴에서 "Realtime Database" 클릭\n';
            errorMessage += '4. 상단 "규칙" 탭 클릭\n';
            errorMessage += '5. 아래 규칙을 복사해서 붙여넣기:\n\n';
            errorMessage += '{\n  "rules": {\n    "todos": {\n      ".read": true,\n      ".write": true\n    }\n  }\n}\n\n';
            errorMessage += '6. "게시" 버튼 클릭';
        } else {
            errorMessage += `에러: ${error.message}`;
        }
        
        alert(errorMessage);
    } finally {
        // 버튼 상태 복원
        addBtn.disabled = false;
        addBtn.textContent = '추가';
    }
}

// 할일 토글 (완료/미완료) - Firebase Realtime Database 사용
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) {
        console.warn('할일을 찾을 수 없습니다. ID:', id);
        return;
    }
    
    // Firebase 연결 확인
    if (!db) {
        alert('Firebase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
        return;
    }
    
    try {
        const newCompletedStatus = !todo.completed;
        console.log('🔄 할일 상태 변경 시도, ID:', id);
        console.log('📊 새로운 상태:', newCompletedStatus ? '완료' : '진행중');
        
        const todoRef = ref(db, `todos/${id}`);
        await update(todoRef, {
            completed: newCompletedStatus
        });
        
        console.log('✅ 할일 상태가 Firebase에서 성공적으로 업데이트되었습니다.');
    } catch (error) {
        console.error('❌ 할일 업데이트 실패:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        
        let errorMessage = '할일 업데이트에 실패했습니다.\n\n';
        
        if (error.code === 'PERMISSION_DENIED') {
            errorMessage += '⚠️ Realtime Database 보안 규칙 문제입니다.\n';
            errorMessage += 'Firebase 콘솔에서 보안 규칙을 확인해주세요.';
        } else {
            errorMessage += `에러: ${error.message}`;
        }
        
        alert(errorMessage);
    }
}

// 할일 삭제 (Firebase Realtime Database 사용)
async function deleteTodo(id) {
    if (confirm('정말 이 할일을 삭제하시겠습니까?')) {
        // Firebase 연결 확인
        if (!db) {
            alert('Firebase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        try {
            console.log('🗑️ 할일 삭제 시도, ID:', id);
            const todoRef = ref(db, `todos/${id}`);
            await remove(todoRef);
            console.log('✅ 할일이 Firebase에서 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('❌ 할일 삭제 실패:', error);
            console.error('에러 코드:', error.code);
            console.error('에러 메시지:', error.message);
            
            let errorMessage = '할일 삭제에 실패했습니다.\n\n';
            
            if (error.code === 'PERMISSION_DENIED') {
                errorMessage += '⚠️ Realtime Database 보안 규칙 문제입니다.\n';
                errorMessage += 'Firebase 콘솔에서 보안 규칙을 확인해주세요.';
            } else {
                errorMessage += `에러: ${error.message}`;
            }
            
            alert(errorMessage);
        }
    }
}

// 할일 수정 모드 시작
function startEdit(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    todoItem.classList.add('editing');
    const input = todoItem.querySelector('.todo-edit-input');
    input.focus();
    input.select();
}

// 할일 수정 저장 (Firebase Realtime Database 사용)
async function saveEdit(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const input = todoItem.querySelector('.todo-edit-input');
    const newText = input.value.trim();
    
    if (newText === '') {
        alert('할일을 입력해주세요!');
        return;
    }
    
    // Firebase 연결 확인
    if (!db) {
        alert('Firebase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
        return;
    }
    
    // 기존 텍스트와 동일한지 확인
    const todo = todos.find(t => t.id === id);
    if (todo && todo.text === newText) {
        // 변경사항이 없으면 수정 모드만 종료
        cancelEdit(id);
        return;
    }
    
    try {
        console.log('✏️ 할일 수정 시도, ID:', id);
        console.log('📝 새로운 텍스트:', newText);
        
        const todoRef = ref(db, `todos/${id}`);
        await update(todoRef, {
            text: newText,
            updatedAt: new Date().toISOString() // 수정 시간 추가
        });
        
        console.log('✅ 할일이 Firebase에서 성공적으로 수정되었습니다.');
    } catch (error) {
        console.error('❌ 할일 수정 실패:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        
        let errorMessage = '할일 수정에 실패했습니다.\n\n';
        
        if (error.code === 'PERMISSION_DENIED') {
            errorMessage += '⚠️ Realtime Database 보안 규칙 문제입니다.\n';
            errorMessage += 'Firebase 콘솔에서 보안 규칙을 확인해주세요.';
        } else {
            errorMessage += `에러: ${error.message}`;
        }
        
        alert(errorMessage);
    }
}

// 할일 수정 취소
function cancelEdit(id) {
    renderTodos();
}

// 전역 스코프에 함수 노출 (onclick, onchange에서 사용하기 위해)
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.startEdit = startEdit;
window.saveEdit = saveEdit;
window.cancelEdit = cancelEdit;

// 완료된 할일 모두 삭제 (Firebase Realtime Database 사용)
async function clearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    const completedCount = completedTodos.length;
    
    if (completedCount === 0) {
        alert('완료된 할일이 없습니다.');
        return;
    }
    
    // Firebase 연결 확인
    if (!db) {
        alert('Firebase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
        return;
    }
    
    if (confirm(`완료된 ${completedCount}개의 할일을 삭제하시겠습니까?`)) {
        try {
            console.log('🗑️ 완료된 할일 일괄 삭제 시도:', completedCount, '개');
            
            // Realtime Database에서는 각각 삭제
            const deletePromises = completedTodos.map(todo => {
                const todoRef = ref(db, `todos/${todo.id}`);
                return remove(todoRef);
            });
            
            await Promise.all(deletePromises);
            console.log('✅ 완료된 할일이 Firebase에서 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('❌ 완료된 할일 삭제 실패:', error);
            console.error('에러 코드:', error.code);
            console.error('에러 메시지:', error.message);
            
            let errorMessage = '완료된 할일 삭제에 실패했습니다.\n\n';
            
            if (error.code === 'PERMISSION_DENIED') {
                errorMessage += '⚠️ Realtime Database 보안 규칙 문제입니다.\n';
                errorMessage += 'Firebase 콘솔에서 보안 규칙을 확인해주세요.';
            } else {
                errorMessage += `에러: ${error.message}`;
            }
            
            alert(errorMessage);
        }
    }
}

// 할일 목록 렌더링
function renderTodos() {
    // 필터링
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }
    
    // 목록 렌더링
    todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<li style="text-align: center; padding: 40px; color: #999;">할일이 없습니다.</li>';
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;
            
            // id를 문자열로 변환하여 전달
            const todoId = `'${todo.id}'`;
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todoId})"
                >
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <input 
                    type="text" 
                    class="todo-edit-input" 
                    value="${escapeHtml(todo.text)}"
                    onkeypress="if(event.key === 'Enter') saveEdit(${todoId})"
                >
                <div class="todo-actions">
                    <button class="btn-icon btn-edit" onclick="startEdit(${todoId})">수정</button>
                    <button class="btn-icon btn-save" onclick="saveEdit(${todoId})">저장</button>
                    <button class="btn-icon btn-cancel" onclick="cancelEdit(${todoId})">취소</button>
                    <button class="btn-icon btn-delete" onclick="deleteTodo(${todoId})">삭제</button>
                </div>
            `;
            
            todoList.appendChild(li);
        });
    }
    
    // 카운트 업데이트
    const activeCount = todos.filter(t => !t.completed).length;
    todoCount.textContent = `${activeCount}개의 할일`;
}

// XSS 방지를 위한 HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Realtime Database에서 할일 목록 실시간 동기화
if (db) {
    console.log('🔄 Realtime Database 실시간 동기화 시작...');
    
    const todosRef = ref(db, 'todos');
    
    onValue(todosRef, 
        (snapshot) => {
            console.log('📥 할일 목록 업데이트');
            todos = [];
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Realtime Database는 객체 형태로 반환되므로 키와 값을 배열로 변환
                Object.keys(data).forEach(key => {
                    todos.push({
                        id: key,
                        ...data[key]
                    });
                });
            }
            
            // 생성일 기준으로 정렬 (최신순)
            todos.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            console.log('✅ 할일 개수:', todos.length);
            renderTodos();
        }, 
        (error) => {
            console.error('❌ 할일 목록 불러오기 실패:', error);
            console.error('에러 코드:', error.code);
            console.error('에러 메시지:', error.message);
            
            let errorMessage = '할일 목록을 불러오는데 실패했습니다.\n\n';
            
            if (error.code === 'PERMISSION_DENIED') {
                errorMessage += '⚠️ Realtime Database 보안 규칙 문제입니다.\n\n';
                errorMessage += '📋 해결 방법:\n';
                errorMessage += '1. Firebase 콘솔 접속: https://console.firebase.google.com\n';
                errorMessage += '2. 프로젝트 선택: bonaringr-todo-backend\n';
                errorMessage += '3. 왼쪽 메뉴에서 "Realtime Database" 클릭\n';
                errorMessage += '4. 상단 "규칙" 탭 클릭\n';
                errorMessage += '5. 아래 규칙을 복사해서 붙여넣기:\n\n';
                errorMessage += '{\n  "rules": {\n    "todos": {\n      ".read": true,\n      ".write": true\n    }\n  }\n}\n\n';
                errorMessage += '6. "게시" 버튼 클릭';
            } else {
                errorMessage += `에러: ${error.message}`;
            }
            
            alert(errorMessage);
        }
    );
} else {
    console.error('❌ Realtime Database가 초기화되지 않아 실시간 동기화를 시작할 수 없습니다.');
    alert('Firebase 연결 오류: 페이지를 새로고침해주세요.');
}
