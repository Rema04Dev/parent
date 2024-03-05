import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, ButtonGroup, Col, ListGroup, Row } from "react-bootstrap";

type User = {
  id: string;
  name: string;
  email: string;
  role: "developer" | "manager" | "designer";
};

const people: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "johndoe@gmail.com",
    role: "developer",
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "janedoe@gmail.com",
    role: "manager",
  },
  {
    id: "3",
    name: "Sam Smith",
    email: "samsmith@gmail.com",
    role: "designer",
  },
];

function App() {
  const [users, setUsers] = useState<User[]>(people);
  const [filter, setFilter] = useState<User["role"] | "all">("all");
  const filteredUsers = users.filter(
    (user) => filter === "all" || user.role === filter
  );

  useEffect(() => {
    console.log("Parent App Loaded");
    window.addEventListener('message', handleMessageFromChild);
    return () => {
      window.removeEventListener('message', handleMessageFromChild);
    };
  }, []);

  const handleMessageFromChild = (event: MessageEvent) => {
    if (event.origin === "http://localhost:3000") {
      console.log("Received message from child:", event.data);
      setFilter(event.data);
    }
  };

  const sendMessageToChild = (message: string) => {
    const childFrame = document.getElementById(
      "childFrame"
    ) as HTMLIFrameElement | null;
    if (childFrame) {
      childFrame.contentWindow?.postMessage(message, "http://localhost:3000");
    }
  };

  const handleButtonClick = (message: User["role"] | "all") => {
    sendMessageToChild(message);
    setFilter(message);
  };

  return (
    <Row className="h-100 w-100">
      <Col className="h-100 w-100">
        <ButtonGroup>
          <Button
            variant="outline-primary"
            active={filter === "all"}
            onClick={() => handleButtonClick("all")}
          >
            all
          </Button>
          <Button
            variant="outline-primary"
            active={filter === "developer"}
            onClick={() => handleButtonClick("developer")}
          >
            developer
          </Button>
          <Button
            variant="outline-primary"
            active={filter === "manager"}
            onClick={() => handleButtonClick("manager")}
          >
            manager
          </Button>
          <Button
            variant="outline-primary"
            active={filter === "designer"}
            onClick={() => handleButtonClick("designer")}
          >
            designer
          </Button>
        </ButtonGroup>
        <ListGroup>
          {filteredUsers.map((user) => (
            <ListGroup.Item key={user.id}>
              {user.name} ({user.email}) - {user.role}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Col>
      <Col className="h-100 w-100">
        <iframe
          id="childFrame"
          src="http://localhost:3000"
          style={{
            border: "3px solid red",
            height: "100%",
            width: "100%",
          }}
        ></iframe>
      </Col>
    </Row>
  );
}

export default App;
