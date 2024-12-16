document.querySelectorAll(".toggle-btn").forEach((button) => {
  button.addEventListener("click", () => {
    // 버튼 바로 다음에 있는 .routine 요소를 찾음
    const routine = button.nextElementSibling;

    // 현재 보이는 상태인지 확인
    const isVisible = routine.style.display === "block";

    // 토글 동작
    routine.style.display = isVisible ? "none" : "block";
  });
});
