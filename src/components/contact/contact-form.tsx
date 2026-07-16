import { zodResolver } from "@hookform/resolvers/zod";
import { Send, RotateCcw, ArrowRight, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ConceptAlert } from "@/components/shared/concept-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { enquiryTypes, type EnquiryType } from "@/data/contact";
import { contactFormSchema, defaultContactValues, type ContactFormValues } from "@/lib/contact-schema";

type ContactFormProps = {
  selectedEnquiryType: EnquiryType;
};

export function ContactForm({ selectedEnquiryType }: ContactFormProps) {
  const [completed, setCompleted] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: defaultContactValues,
    shouldFocusError: true,
    mode: "onSubmit",
  });

  const messageLength = form.watch("message").length;

  useEffect(() => {
    form.setValue("enquiryType", selectedEnquiryType, { shouldValidate: completed ? false : undefined });
  }, [completed, form, selectedEnquiryType]);

  const resetForm = () => {
    form.reset({ ...defaultContactValues, enquiryType: selectedEnquiryType });
    setCompleted(false);
    window.requestAnimationFrame(() => form.setFocus("fullName"));
  };

  const onSubmit = () => {
    setCompleted(true);
    toast.success("Demo form completed. No message was transmitted or stored.");
  };

  if (completed) {
    return (
      <Card id="contact-form" className="scroll-mt-24">
        <CardContent className="p-6">
          <div className="rounded-xl border bg-secondary/35 p-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Demo form completed</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Thanks for reaching out. This demo form was completed successfully, but no message was transmitted or stored.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset Form
              </Button>
              <Button asChild>
                <Link to="/tools">
                  Browse Tools
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="contact-form" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>Complete the demo contact form</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input type="text" autoComplete="name" maxLength={80} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" maxLength={120} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="enquiryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enquiry type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose an enquiry type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {enquiryTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input type="text" maxLength={120} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Message</FormLabel>
                    <span className="text-xs text-muted-foreground" aria-live="polite">
                      {messageLength} / 1500
                    </span>
                  </div>
                  <FormControl>
                    <Textarea maxLength={1500} className="min-h-36 resize-y" {...field} />
                  </FormControl>
                  <FormDescription>Do not include sensitive, confidential or personal document information.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ConceptAlert
              icon={ShieldAlert}
              description="This form demonstrates validation and completion states only. Do not enter sensitive, confidential or personal document information."
            />

            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="rounded-lg border bg-muted/25 p-4">
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="grid gap-1.5">
                      <FormLabel className="leading-6">
                        I understand that this is a demonstration form and no message will be transmitted or stored.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full sm:w-fit">
              <Send className="h-4 w-4" aria-hidden="true" />
              Complete Demo Form
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
