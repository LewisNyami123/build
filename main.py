import tkinter as tk
def change_bt_txt():
    entry.get()
    entry = entry.get()
    button.configure("welcome"+entry)
windows = tk.Tk()
windows.title("My application")
windows.geometry("800x500")
windows.configure(bg="lightblue") 
label = tk.Label(windows,bg="white", fg="black",text="NAME")
label.pack()
entry = tk.Entry(windows,fg="red",bg="white",width=30)
entry.pack()
button = tk.Button(windows, text="Submit", fg="white", bg="red", width=10,command=change_bt_txt)
button.pack()
windows.mainloop()


