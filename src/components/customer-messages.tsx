"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  type CustomerConversation,
  type CustomerMessage,
  useCustomerAuth,
} from "./customer-auth-store";
import { useToast } from "./toast-store";

export function CustomerMessages() {
  const {
    createMessage,
    getMessage,
    listMessages,
    loading: authLoading,
    replyToMessage,
    session,
  } = useCustomerAuth();
  const { pushToast } = useToast();

  const [threads, setThreads] = useState<CustomerConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [messages, setMessages] = useState<CustomerMessage[] | null>(null);
  const [sending, setSending] = useState(false);

  const refreshThreads = useCallback(
    () => listMessages().then(setThreads),
    [listMessages],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setLoading(false);
      return;
    }
    refreshThreads()
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [authLoading, refreshThreads, session]);

  useEffect(() => {
    if (!open) {
      setMessages(null);
      return;
    }
    let live = true;
    setMessages(null);
    getMessage(open)
      .then((items) => live && setMessages(items))
      .catch(() => live && setMessages([]));
    return () => {
      live = false;
    };
  }, [getMessage, open]);

  const report = (error: unknown, code: string) =>
    pushToast({
      code,
      message:
        error instanceof Error
          ? error.message.toUpperCase()
          : "QUICKDASH DID NOT ACCEPT THAT MESSAGE.",
      tone: "error",
    });

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("body") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    if (!body) return;

    setSending(true);
    try {
      if (open) {
        await replyToMessage(open, body);
        setMessages(await getMessage(open));
      } else {
        await createMessage(subject, body);
      }
      form.reset();
      await refreshThreads();
    } catch (error) {
      report(error, "MESSAGE");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <section className="empty-state">
        <p>STATUS / QUERYING</p>
        <h2>LOADING MESSAGE LOG.</h2>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="empty-state">
        <p>% query messages --customer=current</p>
        <h2>AUTHENTICATION REQUIRED.</h2>
        <p>SIGN IN TO READ AND SEND MESSAGES ABOUT YOUR ORDERS.</p>
        <a className="cursor-pointer" href="/account">
          SIGN IN
        </a>
      </section>
    );
  }

  if (failed) {
    return (
      <section className="empty-state">
        <p>STATUS / QUERY_FAILED</p>
        <h2>MESSAGE LOG UNAVAILABLE.</h2>
        <p>THE SESSION IS VALID, BUT QUICKDASH COULD NOT RETURN MESSAGES.</p>
        <button
          className="cursor-pointer"
          onClick={() => location.reload()}
          type="button"
        >
          RETRY
        </button>
      </section>
    );
  }

  return (
    <section className="customer-messages">
      <div className="customer-messages-heading">
        <p>% query messages --customer=current</p>
        {open ? (
          <button
            className="secondary-cta cursor-pointer"
            onClick={() => setOpen(null)}
            type="button"
          >
            NEW MESSAGE
          </button>
        ) : null}
      </div>

      <ol className="message-threads">
        {threads.map((thread) => (
          <li key={thread.id}>
            <button
              className="message-thread-row cursor-pointer"
              data-open={thread.id === open ? "true" : undefined}
              onClick={() => setOpen(thread.id === open ? null : thread.id)}
              type="button"
            >
              <span>{thread.subject.toUpperCase()}</span>
              <span>{thread.status.toUpperCase()}</span>
            </button>
          </li>
        ))}
      </ol>

      {open && messages !== null ? (
        messages.length === 0 ? (
          <p className="message-thread-empty">NO MESSAGES ON THIS ORDER YET.</p>
        ) : (
          <ol className="message-thread">
            {messages.map((message) => (
              <li
                key={message.id}
                className="message"
                data-sender={message.sender}
              >
                <header>
                  <span className="message-sender">
                    {message.sender === "operator"
                      ? "CAFFEINATE"
                      : message.sender === "system"
                        ? "SYSTEM"
                        : "YOU"}
                  </span>
                  {message.createdAt ? (
                    <time dateTime={message.createdAt}>
                      {new Date(message.createdAt).toLocaleString("en-CA", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </time>
                  ) : null}
                </header>
                <p className="message-body">{message.body}</p>
              </li>
            ))}
          </ol>
        )
      ) : null}

      <form className="message-form" onSubmit={send}>
        {open ? null : (
          <>
            <label htmlFor="message-subject">SUBJECT</label>
            <input id="message-subject" name="subject" required />
          </>
        )}
        <label htmlFor="message-body">MESSAGE</label>
        <textarea id="message-body" name="body" required rows={4} />
        <div className="checkout-actions">
          <button className="cursor-pointer" disabled={sending} type="submit">
            {sending ? "SENDING..." : open ? "SEND REPLY" : "START THREAD"}
          </button>
        </div>
      </form>
    </section>
  );
}
