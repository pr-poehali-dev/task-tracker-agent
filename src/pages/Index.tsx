import { useState } from "react";
import Icon from "@/components/ui/icon";

type Priority = "high" | "medium" | "low";
type Status = "active" | "done" | "closed";
type Tab = "tasks" | "add" | "history" | "settings";
type Filter = "all" | Priority;

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  reminder?: string;
  createdAt: string;
  completedAt?: string;
}

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

const PRIORITY_DOT: Record<Priority, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-emerald-500",
};

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Проверить статус API",
    description: "Убедиться, что все эндпоинты доступны и отвечают корректно",
    priority: "high",
    status: "active",
    reminder: "09:00",
    createdAt: "2026-05-19T08:00:00",
  },
  {
    id: "2",
    title: "Обновить документацию",
    description: "Добавить описание новых методов в README",
    priority: "medium",
    status: "active",
    reminder: "14:00",
    createdAt: "2026-05-19T09:30:00",
  },
  {
    id: "3",
    title: "Настроить мониторинг",
    description: "Подключить алёрты на ошибки в продакшне",
    priority: "low",
    status: "active",
    createdAt: "2026-05-18T16:00:00",
  },
  {
    id: "4",
    title: "Деплой новой версии",
    description: "Выгрузить сборку 2.1.4 на сервер",
    priority: "high",
    status: "done",
    createdAt: "2026-05-17T10:00:00",
    completedAt: "2026-05-17T15:30:00",
  },
  {
    id: "5",
    title: "Бэкап базы данных",
    description: "Плановое копирование данных за неделю",
    priority: "medium",
    status: "closed",
    createdAt: "2026-05-16T08:00:00",
    completedAt: "2026-05-16T08:45:00",
  },
];

const INITIAL_SETTINGS = {
  checkInterval: "30",
  notifyBefore: "15",
  soundEnabled: true,
  dailyDigest: true,
  digestTime: "08:00",
  autoClose: false,
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

const Index = () => {
  const [tab, setTab] = useState<Tab>("tasks");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<Filter>("all");
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    reminder: "",
  });
  const [addSuccess, setAddSuccess] = useState(false);

  const activeTasks = tasks.filter((t) => t.status === "active");
  const historyTasks = tasks.filter((t) => t.status !== "active");

  const filteredActive =
    filter === "all"
      ? activeTasks
      : activeTasks.filter((t) => t.priority === filter);

  function completeTask(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "done", completedAt: new Date().toISOString() }
          : t
      )
    );
  }

  function closeTask(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "closed", completedAt: new Date().toISOString() }
          : t
      )
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function addTask() {
    if (!form.title.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: "active",
      reminder: form.reminder || undefined,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setForm({ title: "", description: "", priority: "medium", reminder: "" });
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2500);
    setTimeout(() => setTab("tasks"), 400);
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "tasks", label: "Задачи", icon: "CheckSquare" },
    { id: "add", label: "Добавить", icon: "Plus" },
    { id: "history", label: "История", icon: "Clock" },
    { id: "settings", label: "Настройки", icon: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center">
              <Icon name="Zap" size={14} className="text-background" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              Агент
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {activeTasks.length} активных
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-6">
        {/* TASKS TAB */}
        {tab === "tasks" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-5">
              {(["all", "high", "medium", "low"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filter === f
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "Все" : PRIORITY_LABEL[f as Priority]}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">
                {filteredActive.length} задач
              </span>
            </div>

            {filteredActive.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Нет задач в этой категории</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredActive.map((task) => (
                  <div
                    key={task.id}
                    className="bg-card border border-border rounded-lg p-4 hover-scale"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => completeTask(task.id)}
                        className="mt-0.5 w-4 h-4 rounded border border-border flex-shrink-0 hover:border-foreground transition-colors flex items-center justify-center"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`}
                          />
                          <span className="font-medium text-sm text-foreground truncate">
                            {task.title}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatDate(task.createdAt)}</span>
                          {task.reminder && (
                            <span className="flex items-center gap-1">
                              <Icon name="Bell" size={10} />
                              {task.reminder}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => closeTask(task.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD TAB */}
        {tab === "add" && (
          <div className="animate-fade-in">
            <h2 className="font-semibold text-base mb-5">Новая задача</h2>

            {addSuccess && (
              <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-sm animate-fade-in">
                <Icon name="CheckCircle" size={15} />
                Задача добавлена
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Название
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Что нужно сделать?"
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Описание
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Подробности задачи..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/40 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Приоритет
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["high", "medium", "low"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm((f) => ({ ...f, priority: p }))}
                      className={`py-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                        form.priority === p
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          form.priority === p ? "bg-background" : PRIORITY_DOT[p]
                        }`}
                      />
                      {PRIORITY_LABEL[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Напоминание
                </label>
                <div className="relative">
                  <Icon
                    name="Bell"
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="time"
                    value={form.reminder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, reminder: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={addTask}
                disabled={!form.title.trim()}
                className="w-full py-3 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Добавить задачу
              </button>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div className="animate-fade-in">
            <h2 className="font-semibold text-base mb-5">История</h2>

            {historyTasks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Icon name="Clock" size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">История пуста</p>
              </div>
            ) : (
              <div className="space-y-2">
                {historyTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-card border border-border rounded-lg p-4 opacity-70"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${
                          task.status === "done" ? "bg-foreground" : "bg-muted"
                        }`}
                      >
                        <Icon
                          name={task.status === "done" ? "Check" : "Minus"}
                          size={10}
                          className={
                            task.status === "done"
                              ? "text-background"
                              : "text-muted-foreground"
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`}
                          />
                          <span className="text-sm text-foreground line-through truncate">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${
                              task.status === "done"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {task.status === "done" ? "Выполнено" : "Закрыто"}
                          </span>
                          {task.completedAt && (
                            <span>
                              {formatDate(task.completedAt)},{" "}
                              {formatTime(task.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 flex-shrink-0"
                      >
                        <Icon name="Trash2" size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div className="animate-fade-in">
            <h2 className="font-semibold text-base mb-5">Настройки агента</h2>

            <div className="space-y-3">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="RefreshCw" size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Интервал проверки</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    каждые {settings.checkInterval} мин
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={settings.checkInterval}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, checkInterval: e.target.value }))
                  }
                  className="w-full accent-foreground"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 мин</span>
                  <span>120 мин</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Bell" size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Уведомлять заранее</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    за {settings.notifyBefore} мин
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={settings.notifyBefore}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, notifyBefore: e.target.value }))
                  }
                  className="w-full accent-foreground"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 мин</span>
                  <span>60 мин</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Sunrise" size={14} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Утренний дайджест</p>
                      <p className="text-xs text-muted-foreground">Сводка задач на день</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSettings((s) => ({ ...s, dailyDigest: !s.dailyDigest }))
                    }
                    className="relative rounded-full transition-all flex-shrink-0"
                    style={{
                      height: "22px",
                      width: "40px",
                      background: settings.dailyDigest
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--border))",
                    }}
                  >
                    <div
                      className="absolute top-0.5 bg-white rounded-full shadow transition-all"
                      style={{
                        width: "18px",
                        height: "18px",
                        left: settings.dailyDigest ? "calc(100% - 20px)" : "2px",
                      }}
                    />
                  </button>
                </div>
                {settings.dailyDigest && (
                  <input
                    type="time"
                    value={settings.digestTime}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, digestTime: e.target.value }))
                    }
                    className="px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
                  />
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Volume2" size={14} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Звук уведомлений</p>
                      <p className="text-xs text-muted-foreground">Аудиосигнал при напоминании</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
                    }
                    className="relative rounded-full transition-all flex-shrink-0"
                    style={{
                      height: "22px",
                      width: "40px",
                      background: settings.soundEnabled
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--border))",
                    }}
                  >
                    <div
                      className="absolute top-0.5 bg-white rounded-full shadow transition-all"
                      style={{
                        width: "18px",
                        height: "18px",
                        left: settings.soundEnabled ? "calc(100% - 20px)" : "2px",
                      }}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Archive" size={14} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Автозакрытие</p>
                      <p className="text-xs text-muted-foreground">Закрывать выполненные через 24 ч</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSettings((s) => ({ ...s, autoClose: !s.autoClose }))
                    }
                    className="relative rounded-full transition-all flex-shrink-0"
                    style={{
                      height: "22px",
                      width: "40px",
                      background: settings.autoClose
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--border))",
                    }}
                  >
                    <div
                      className="absolute top-0.5 bg-white rounded-full shadow transition-all"
                      style={{
                        width: "18px",
                        height: "18px",
                        left: settings.autoClose ? "calc(100% - 20px)" : "2px",
                      }}
                    />
                  </button>
                </div>
              </div>

              <button className="w-full py-3 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-all">
                Сохранить настройки
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="border-t border-border bg-card sticky bottom-0">
        <div className="max-w-2xl mx-auto px-2 py-2 grid grid-cols-4 gap-1">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all ${
                tab === id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon name={icon} size={16} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
