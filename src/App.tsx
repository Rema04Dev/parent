import { useCallback, useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Button,
  ButtonGroup,
  Col,
  Form,
  ListGroup,
  Row,
  Stack,
} from "react-bootstrap";

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

type MessageFromObject = {
  payload: {
    filter: User["role"] | "all";
  };
  type: "object";
};

type MessageFromString = {
  text: string;
  type: "string";
};

type MessageFrom = MessageFromObject | MessageFromString;

function App() {
  const [isFrameShow, setIsFrameShow] = useState(false);
  const toggleFrameShow = () => setIsFrameShow((prev) => !prev);

  const [users, setUsers] = useState<User[]>(people);
  const [filter, setFilter] = useState<User["role"] | "all">("all");
  const filteredUsers = users.filter(
    (user) => filter === "all" || user.role === filter
  );

  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [messageFromChild, setMessageFromChild] = useState("");
  const [inputValue, setInputValue] = useState("");

  const messageHandler = useCallback((event: MessageEvent) => {
    if (event.origin !== "http://localhost:3000") return;
    if (typeof event.data !== "string") return;

    let eventMessage: MessageFrom;
    try {
      eventMessage = JSON.parse(event.data);
    } catch (error) {
      console.error("Error parsing JSON", error);
      return;
    }

    if (eventMessage.type === "object") {
      setFilter(eventMessage.payload.filter);
      return;
    }
    if (eventMessage.type === "string") {
      setMessageFromChild(eventMessage.text);
      return;
    }
  }, []);

  const sendMessageToChild = useCallback((message: MessageFrom) => {
    if (!frameRef?.current?.contentWindow) return;
    frameRef.current.contentWindow.postMessage(
      JSON.stringify(message),
      "http://localhost:3000"
    );
  }, []);

  useEffect(() => {
    window.addEventListener("message", messageHandler);
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, [messageHandler]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
  
    const handleLoad = () => {
      sendMessageToChild({
        payload: {
          filter,
        },
        type: "object",
      });
    };
  
    frame.addEventListener('load', handleLoad);
    return () => {
      frame.removeEventListener('load', handleLoad);
    };
  }, [filter, sendMessageToChild]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    sendMessageToChild({
      text: e.target.value,
      type: "string",
    });
  };

  const handleClick = (filter: User["role"] | "all") => {
    setFilter(filter);
    sendMessageToChild({
      payload: {
        filter,
      },
      type: "object",
    });
  };

  return (
    <Row className="h-100 w-100">
      <Col className="h-100 w-100">
        <Stack direction="horizontal" gap={3}>
          <h1>Parent App</h1>
          <Button
            onClick={toggleFrameShow}
            variant={isFrameShow ? "danger" : "success"}
          >
            {isFrameShow ? "Размонтировать фрейм" : "Вмонтировать фрейм"}
          </Button>
        </Stack>
        <hr />
        <ButtonGroup>
          <Button
            variant="outline-primary"
            active={filter === "all"}
            onClick={() => handleClick("all")}
          >
            all
          </Button>
          <Button
            variant="outline-primary"
            active={filter === "developer"}
            onClick={() => handleClick("developer")}
          >
            developer
          </Button>
          <Button
            variant="outline-primary"
            active={filter === "manager"}
            onClick={() => handleClick("manager")}
          >
            manager
          </Button>
          <Button
            variant="outline-primary"
            active={filter === "designer"}
            onClick={() => handleClick("designer")}
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
        <div className="mt-5">
          <h2 className="h4">Message from child</h2>
          <pre>{messageFromChild || "No message from child yet..."}</pre>
          <Form>
            <h2 className="h4">Message to child</h2>
            <Form.Control
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter a message..."
            />
          </Form>
        </div>
      </Col>
      {isFrameShow && (
        <Col className="h-100 w-100">
          <iframe
            ref={frameRef}
            onLoad={() => {
              sendMessageToChild({
                payload: {
                  filter,
                },
                type: "object",
              });
            }
            }
            id="childFrame"
            src="http://localhost:3000"
            style={{
              border: "3px solid red",
              height: "100%",
              width: "100%",
            }}
          ></iframe>
        </Col>
      )}
    </Row>
  );
}

export default App;
