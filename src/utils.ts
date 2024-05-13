export function deactivateAllButtonsExcept(buttonId: string){
    const buttons = document.querySelectorAll<HTMLButtonElement>("#toolbar button"); // Narrow down the type to HTMLButtonElement
    buttons.forEach(button => {
        if (button.id !== buttonId) {
            button.disabled = true;
        }
    });
}

export function enableAllButtons(){
    const buttons = document.querySelectorAll<HTMLButtonElement>("#toolbar button"); // Narrow down the type to HTMLButtonElement
    buttons.forEach(button => {
        button.disabled = false;
    });
}