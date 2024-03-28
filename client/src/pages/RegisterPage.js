import { useState } from "react";

export default function RegisterPage() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function register(e) {
        e.preventDefault();
        const response = await fetch("https://bloogger-ovb2.onrender.com/register", {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
            }),
            headers: {"content-type": "application/json"},
        });

        if (response.status === 200) {
            alert("registered successfully");
        } else {
            alert("failed to register");
        }

    }

    return(
        <form className="register" onSubmit={register}>
            <h1>Register</h1>
            <input type="text"
                    placeholder="username"
                    value={username}
                    onChange={ev => setUsername(ev.target.value)}/>
            <input type="password"
                    placeholder="password"
                    value={password}
                    onChange={ev => setPassword(ev.target.value)}/>
            <button>Register</button>
        </form>
    )

}